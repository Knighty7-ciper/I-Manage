import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { FileText, Download, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PortalDocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: link } = await supabase
    .from("tenant_users")
    .select("tenant_id, tenants(property_id)")
    .eq("user_id", user.id)
    .maybeSingle()
  if (!link) return null

  const tenantId = link.tenant_id
  const propertyId = (link as any).tenants?.property_id

  let query = supabase
    .from("documents")
    .select("id, name, type, file_url, file_size, mime_type, created_at, expiry_date, properties(name)")
    .order("created_at", { ascending: false })
  if (tenantId) {
    query = query.or(`tenant_id.eq.${tenantId}${propertyId ? `,property_id.eq.${propertyId}` : ""}`)
  } else if (propertyId) {
    query = query.eq("property_id", propertyId)
  }

  const { data: docs } = await query

  function expiryStatus(date: string | null) {
    if (!date) return null
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, variant: "destructive" as const }
    if (days <= 7) return { label: `Expires in ${days}d`, variant: "destructive" as const }
    if (days <= 30) return { label: `Expires in ${days}d`, variant: "secondary" as const }
    return { label: `Expires ${formatDate(date)}`, variant: "outline" as const }
  }

  return (
    <div className="space-y-6 pt-2 md:pt-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Documents
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Lease, agreements, and any documents shared with you.
        </p>
      </div>

      {!docs || docs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-3" />
            <p className="text-muted-foreground">No documents yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map((d: any) => {
            const ex = expiryStatus(d.expiry_date)
            return (
              <Card key={d.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{d.name}</CardTitle>
                      <CardDescription className="text-xs capitalize">{d.type} · {d.properties?.name || "—"}</CardDescription>
                    </div>
                    {ex && (
                      <Badge variant={ex.variant} className="text-xs flex-shrink-0">
                        {ex.label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Uploaded {formatDate(d.created_at)}</span>
                  <Button asChild size="sm" variant="outline">
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-3 w-3 mr-1" />
                      Open
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
