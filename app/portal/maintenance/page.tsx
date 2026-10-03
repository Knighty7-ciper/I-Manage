import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Wrench, Plus } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const priorityColor = (p: string) =>
  p === "urgent" ? "destructive"
  : p === "high" ? "destructive"
  : p === "low" ? "secondary"
  : "outline"

const statusColor = (s: string) =>
  s === "completed" ? "default"
  : s === "open" ? "destructive"
  : s === "in_progress" ? "secondary"
  : "outline"

export default async function PortalMaintenancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: link } = await supabase
    .from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle()
  if (!link) return null

  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, status, priority, category, created_at, scheduled_date, completed_date, properties(name)")
    .eq("tenant_id", link.tenant_id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 pt-2 md:pt-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Maintenance
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Submit and track issues with your unit.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/maintenance/new">
            <Plus className="h-4 w-4 mr-2" />
            New request
          </Link>
        </Button>
      </div>

      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-3" />
            <p className="text-muted-foreground mb-3">No maintenance requests yet.</p>
            <Button asChild>
              <Link href="/portal/maintenance/new">
                <Plus className="h-4 w-4 mr-2" />
                Submit your first request
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {r.category} · {r.properties?.name || "—"} · {formatDate(r.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={priorityColor(r.priority) as any}>{r.priority}</Badge>
                    <Badge variant={statusColor(r.status) as any}>{r.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              {(r.description || r.scheduled_date) && (
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {r.description && <p className="line-clamp-3">{r.description}</p>}
                  {r.scheduled_date && (
                    <p className="text-xs">Scheduled for {formatDate(r.scheduled_date)}</p>
                  )}
                  {r.completed_date && (
                    <p className="text-xs text-chart-4">Completed {formatDate(r.completed_date)}</p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
