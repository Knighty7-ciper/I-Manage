import { withAuth, successResponse, errorResponse } from "@/lib/api"

/**
 * GET /api/portal/me
 * Returns the current tenant's profile (resolved via the tenant_users
 * link). Returns 403 if the caller is not linked to any tenant.
 */
export const GET = withAuth(async (_req, { supabase, userId }) => {
  const { data: link, error: linkErr } = await supabase
    .from("tenant_users")
    .select(`
      id,
      tenant_id,
      tenants (
        id, full_name, first_name, last_name, email, phone,
        property_id, monthly_rent, deposit_amount,
        lease_start_date, lease_end_date, status, notes,
        properties (id, name, address, city, county, type, bedrooms, bathrooms)
      )
    `)
    .eq("user_id", userId)
    .maybeSingle()
  if (linkErr) return errorResponse(linkErr.message, 500)
  if (!link) {
    return errorResponse("No tenant link for this user", 403)
  }
  return successResponse(link)
})
