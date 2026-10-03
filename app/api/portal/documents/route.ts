import { withAuth, successResponse, errorResponse } from "@/lib/api"

/**
 * GET /api/portal/documents
 * Returns documents linked to this tenant (or to their property).
 */
export const GET = withAuth(async (_req, { supabase, userId }) => {
  const { data: link, error: linkErr } = await supabase
    .from("tenant_users")
    .select("tenant_id, tenants(property_id)")
    .eq("user_id", userId)
    .maybeSingle()
  if (linkErr) return errorResponse(linkErr.message, 500)
  if (!link) return errorResponse("No tenant link", 403)
  const tenantId = link.tenant_id
  const propertyId = (link as any).tenants?.property_id

  let q = supabase
    .from("documents")
    .select("id, name, type, file_url, file_size, mime_type, created_at, expiry_date, property_id, properties(name)")
    .order("created_at", { ascending: false })
  if (tenantId) q = q.or(`tenant_id.eq.${tenantId}${propertyId ? `,property_id.eq.${propertyId}` : ""}`)
  else if (propertyId) q = q.eq("property_id", propertyId)
  else return successResponse([])

  const { data, error } = await q
  if (error) return errorResponse(error.message, 500)
  return successResponse(data || [])
})
