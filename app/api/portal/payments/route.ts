import { withAuth, successResponse, errorResponse } from "@/lib/api"

/**
 * GET /api/portal/payments
 * Returns the current tenant's payment history.
 */
export const GET = withAuth(async (_req, { supabase, userId }) => {
  // resolve tenant id
  const { data: link, error: linkErr } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", userId)
    .maybeSingle()
  if (linkErr) return errorResponse(linkErr.message, 500)
  if (!link) return errorResponse("No tenant link", 403)
  const tenantId = link.tenant_id

  const { data, error } = await supabase
    .from("rent_payments")
    .select("id, amount, due_date, paid_date, payment_method, status, reference_number, notes, property_id, properties(name)")
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: false })
  if (error) return errorResponse(error.message, 500)
  return successResponse(data || [])
})
