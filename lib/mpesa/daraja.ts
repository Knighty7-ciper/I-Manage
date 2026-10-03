/**
 * Safaricom Daraja M-Pesa API client.
 *
 * Supports:
 *   - OAuth access token (sandbox + production)
 *   - Lipa Na M-Pesa Online (STK Push)
 *   - STK Push transaction status query
 *   - Callback signature validation (IP allowlist — production only)
 *
 * Reads credentials from environment variables:
 *
 *   MPESA_ENV                "sandbox" | "production"  (default: sandbox)
 *   MPESA_CONSUMER_KEY       string
 *   MPESA_CONSUMER_SECRET    string
 *   MPESA_SHORTCODE          string  (PayBill or Till number, e.g. 174379)
 *   MPESA_PASSKEY            string  (Lipa Na M-Pesa passkey, given by Safaricom)
 *   MPESA_CALLBACK_URL       string  (publicly reachable HTTPS endpoint)
 *   MPESA_INITIATOR_NAME     string  (optional, for B2C — not used here)
 *   MPESA_ALLOWED_CALLBACK_IPS  comma-separated CIDRs (optional)
 *
 * For local development without real credentials, set MPESA_SANDBOX_MOCK=1
 * and the helper will return synthetic (but real-shaped) responses. Useful
 * for UI work without touching Daraja.
 */

import crypto from "node:crypto"

export type DarajaEnv = "sandbox" | "production"

export interface DarajaConfig {
  env: DarajaEnv
  baseUrl: string
  consumerKey: string
  consumerSecret: string
  shortCode: string
  passkey: string
  callbackUrl: string
  mock: boolean
}

const SANDBOX = "https://sandbox.safaricom.co.ke"
const PRODUCTION = "https://api.safaricom.co.ke"

let cachedToken: { value: string; expiresAt: number } | null = null

function loadConfig(): DarajaConfig {
  const env = (process.env.MPESA_ENV === "production" ? "production" : "sandbox") as DarajaEnv
  return {
    env,
    baseUrl: env === "production" ? PRODUCTION : SANDBOX,
    consumerKey: process.env.MPESA_CONSUMER_KEY || "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
    shortCode: process.env.MPESA_SHORTCODE || "",
    passkey: process.env.MPESA_PASSKEY || "",
    callbackUrl: process.env.MPESA_CALLBACK_URL || "",
    mock: process.env.MPESA_SANDBOX_MOCK === "1",
  }
}

export function darajaConfigured(): boolean {
  const c = loadConfig()
  return Boolean(c.consumerKey && c.consumerSecret && c.shortCode && c.passkey && c.callbackUrl)
}

/**
 * OAuth access token. Cached until ~50 minutes from issue.
 * Returns null in mock mode.
 */
export async function getAccessToken(): Promise<string | null> {
  const cfg = loadConfig()
  if (cfg.mock) return null

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }

  const auth = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString("base64")
  const res = await fetch(`${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Daraja OAuth failed: ${res.status} ${text}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: string }
  cachedToken = {
    value: json.access_token,
    // Daraja's expires_in is in seconds (typically 3599).
    expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000,
  }
  return cachedToken.value
}

/**
 * Timestamp in Daraja's required format: YYYYMMDDHHmmss in EAT (UTC+3).
 */
export function darajaTimestamp(d: Date = new Date()): string {
  const eat = new Date(d.getTime() + 3 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    eat.getUTCFullYear().toString() +
    pad(eat.getUTCMonth() + 1) +
    pad(eat.getUTCDate()) +
    pad(eat.getUTCHours()) +
    pad(eat.getUTCMinutes()) +
    pad(eat.getUTCSeconds())
  )
}

/**
 * Generate the STK Push password: base64(shortcode + passkey + timestamp).
 */
export function stkPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")
}

export interface StkPushRequest {
  phone: string          // E.164 or 2547XXXXXXXX
  amount: number         // integer KES
  accountReference: string
  transactionDesc?: string
}

export interface StkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage?: string
}

/**
 * Initiate an STK Push. Caller provides the phone in either
 * `2547XXXXXXXX` or `07XXXXXXXX` format — we'll normalize.
 *
 * In mock mode, returns a synthetic successful response (useful for local UI).
 */
export async function stkPush(req: StkPushRequest): Promise<StkPushResponse> {
  const cfg = loadConfig()
  const phone = normalizePhone(req.phone)

  if (cfg.mock) {
    return {
      MerchantRequestID: "mock-merchant-" + crypto.randomBytes(4).toString("hex"),
      CheckoutRequestID: "ws_CO_" + Date.now() + crypto.randomBytes(3).toString("hex"),
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "Success. Mocked STK Push.",
    }
  }

  const token = await getAccessToken()
  if (!token) throw new Error("No Daraja access token")

  const timestamp = darajaTimestamp()
  const password = stkPassword(cfg.shortCode, cfg.passkey, timestamp)
  const body = {
    BusinessShortCode: cfg.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(req.amount),
    PartyA: phone,
    PartyB: cfg.shortCode,
    PhoneNumber: phone,
    CallBackURL: cfg.callbackUrl,
    AccountReference: req.accountReference.slice(0, 12),
    TransactionDesc: (req.transactionDesc || "Rent Payment").slice(0, 13),
  }

  const res = await fetch(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = { ResponseDescription: text } }
  if (!res.ok) {
    throw new Error(`STK push failed: ${res.status} ${JSON.stringify(json)}`)
  }
  return json as StkPushResponse
}

export interface StkQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID?: string
  CheckoutRequestID?: string
  ResultCode?: string
  ResultDesc?: string
}

/**
 * Query the status of an STK push by CheckoutRequestID.
 */
export async function stkQuery(checkoutRequestId: string): Promise<StkQueryResponse> {
  const cfg = loadConfig()
  if (cfg.mock) {
    return {
      ResponseCode: "0",
      ResponseDescription: "The service request has been accepted successfully",
      MerchantRequestID: "mock-merchant",
      CheckoutRequestID: checkoutRequestId,
      ResultCode: "0",
      ResultDesc: "The service request is processed successfully.",
    }
  }
  const token = await getAccessToken()
  if (!token) throw new Error("No Daraja access token")
  const timestamp = darajaTimestamp()
  const password = stkPassword(cfg.shortCode, cfg.passkey, timestamp)
  const res = await fetch(`${cfg.baseUrl}/mpesa/transactionstatus/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Initiator: process.env.MPESA_INITIATOR_NAME || "",
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "",
      CommandID: "TransactionStatusQuery",
      TransactionID: checkoutRequestId,
      PartyA: cfg.shortCode,
      IdentifierType: "4",
      ResultURL: cfg.callbackUrl,
      QueueTimeOutURL: cfg.callbackUrl,
      Remarks: "Status query",
      Occasion: "RentStatus",
    }),
    cache: "no-store",
  })
  const json = (await res.json()) as StkQueryResponse
  if (!res.ok) {
    throw new Error(`STK query failed: ${res.status} ${JSON.stringify(json)}`)
  }
  return json
}

/**
 * Normalize a Kenyan phone to 2547XXXXXXXX format.
 * Accepts: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX, 7XXXXXXXX.
 */
export function normalizePhone(input: string): string {
  const trimmed = (input || "").replace(/\s+/g, "").replace(/^\+/, "")
  if (/^254\d{9}$/.test(trimmed)) return trimmed
  if (/^0\d{9}$/.test(trimmed)) return "254" + trimmed.slice(1)
  if (/^\d{9}$/.test(trimmed)) return "254" + trimmed
  return trimmed
}

/**
 * Validate a Kenyan phone number. Returns true if it normalizes to 2547XXXXXXXX.
 */
export function isValidKenyanPhone(input: string): boolean {
  return /^254(7|1)\d{8}$/.test(normalizePhone(input))
}

/**
 * Validate that the request is coming from Safaricom (callback only).
 * Uses a configured IP allowlist (comma-separated CIDRs or plain IPs).
 */
export function isFromSafaricom(remoteAddr: string | null): boolean {
  const list = (process.env.MPESA_ALLOWED_CALLBACK_IPS || "").split(",").map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) {
    return process.env.MPESA_ENV !== "production"
  }
  if (!remoteAddr) return false
  for (const allowed of list) {
    if (allowed.includes("/")) {
      // CIDR
      if (ipInCidr(remoteAddr, allowed)) return true
    } else if (allowed === remoteAddr) {
      return true
    }
  }
  return false
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/")
  const bits = Number(bitsStr)
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false
  const ipInt = ipToInt(ip)
  const baseInt = ipToInt(base)
  if (ipInt === null || baseInt === null) return false
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (ipInt & mask) === (baseInt & mask)
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".")
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    const x = Number(p)
    if (isNaN(x) || x < 0 || x > 255) return null
    n = (n * 256) + x
  }
  return n
}
