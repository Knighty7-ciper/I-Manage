import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"
import { DollarSign } from "lucide-react"

export const dynamic = "force-dynamic"

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n)
}

export default async function PortalPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: link } = await supabase
    .from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle()
  if (!link) return null

  const { data: payments } = await supabase
    .from("rent_payments")
    .select("id, amount, due_date, paid_date, payment_method, status, reference_number, notes, properties(name)")
    .eq("tenant_id", link.tenant_id)
    .order("due_date", { ascending: false })

  const totalPaid = (payments || [])
    .filter((p: any) => p.status === "paid" || p.status === "completed")
    .reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
  const totalDue = (payments || [])
    .filter((p: any) => p.status === "pending" || p.status === "late" || p.status === "failed")
    .reduce((s: number, p: any) => s + Number(p.amount || 0), 0)

  return (
    <div className="space-y-6 pt-2 md:pt-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Payment History
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          All your rent payments in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-chart-4 tabular-nums">{fmtCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive tabular-nums">{fmtCurrency(totalDue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Payments</CardTitle>
          <CardDescription className="text-sm">{payments?.length || 0} record(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!payments || payments.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No payments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(p.due_date)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.properties?.name || "—"}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtCurrency(Number(p.amount))}
                      </TableCell>
                      <TableCell className="text-xs capitalize">{p.payment_method || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "paid" || p.status === "completed" ? "default" : p.status === "late" || p.status === "failed" ? "destructive" : "secondary"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.reference_number || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
