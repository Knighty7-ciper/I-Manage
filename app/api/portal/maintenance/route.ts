import { withAuth, successResponse, errorResponse, pickFields, blankToNull, HttpError } from "@/lib/api"

/**
 * GET /api/portal/maintenance
 * Returns the current tenant's maintenance requests.
 *
 * POST /api/portal/maintenance
 * Body: { title, description, category?, priority?, property_id? }
 * Tenants can create maintenance requests for their own property.
 */
export const GET = withAuth(async (_req, { supabase, userId }) => {
  const { data: link, error: linkErr } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", userId)
    .maybeSingle()
  if (linkErr) return errorResponse(linkErr.message, 500)
  if (!link) return errorResponse("No tenant link", 403)

  const { data, error } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, status, priority, category, created_at, scheduled_date, completed_date, property_id, properties(name)")
    .eq("tenant_id", link.tenant_id)
    .order("created_at", { ascending: false })
  if (error) return errorResponse(error.message, 500)
  return successResponse(data || [])
})

const ALLOWED_FIELDS = [
  "title",
  "description",
  "category",
  "priority",
  "property_id",
  "scheduled_date",
] as const

export const POST = withAuth(async (req, { supabase, userId }) => {
  const body = await req.json().catch(() => null)
  const fields = pickFields<Record<string, any>>(body, ALLOWED_FIELDS)
  if (!fields.title) throw new HttpError("title required", 400)
  if (!fields.description) throw new HttpError("description required", 400)

  const { data: link, error: linkErr } = await supabase
    .from("tenant_users")
    .select("tenant_id, tenants(property_id)")
    .eq("user_id", userId)
    .maybeSingle()
  if (linkErr) return errorResponse(linkErr.message, 500)
  if (!link) return errorResponse("No tenant link", 403)

  // Use the property from the tenant link if not provided
  const propertyId = blankToNull(fields.property_id) || (link as any).tenants?.property_id || null
  if (!propertyId) throw new HttpError("No property associated with tenant", 400)

  // The tenant's user_id on the request maps to the landlord's user_id
  // (the request belongs to the landlord's account, not the tenant's auth
  // account — that's intentional, so the landlord's notification + dashboard
  // surfaces it).
  const { data: linkRow } = await supabase
    .from("tenants")
    .select("user_id")
    .eq("id", link.tenant_id)
    .maybeSingle()
  const landlordId = (linkRow as any)?.user_id
  if (!landlordId) throw new HttpError("Landlord not found", 400)

  const insert = {
    user_id: landlordId,
    property_id: propertyId,
    tenant_id: link.tenant_id,
    title: fields.title,
    description: fields.description,
    category: blankToNull(fields.category) || "general",
    priority: blankToNull(fields.priority) || "medium",
    status: "open",
    scheduled_date: blankToNull(fields.scheduled_date),
  }
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert(insert)
    .select()
    .single()
  if (error) return errorResponse(error.message, 500)
  return successResponse(data, 201)
})
