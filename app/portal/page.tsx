import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Home, DollarSign, CalendarClock, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDate, tenantName } from "@/lib/utils"
import { TenantPayRent } from "@/components/tenant-pay-rent"

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n)
}

export const dynamic = "force-dynamic"

export default async function PortalHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: link } = await supabase
    .from("tenant_users")
    .select(`
      tenant_id,
      tenants (
        id, full_name, first_name, last_name, monthly_rent, deposit_amount,
        lease_start_date, lease_end_date, status,
        properties (id, name, address, city, county, type, bedrooms, bathrooms)
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle()
  const tenant: any = (link as any)?.tenants
  if (!tenant) return null
  const property: any = tenant.properties

  // Pull this month's payment + a couple of recent payments in one trip
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = today.slice(0, 7) + "-01"
  const [recent, thisMonth, maintOpen] = await Promise.all([
    supabase.from("rent_payments")
      .select("id, amount, due_date, status")
      .eq("tenant_id", tenant.id)
      .order("due_date", { ascending: false })
      .limit(5),
    supabase.from("rent_payments")
      .select("id, amount, due_date, status")
      .eq("tenant_id", tenant.id)
      .gte("due_date", monthStart)
      .lte("due_date", today)
      .maybeSingle(),
    supabase.from("maintenance_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .in("status", ["open", "in_progress"]),
  ])

  const todayDate = new Date()
  const endDate = tenant.lease_end_date ? new Date(tenant.lease_end_date) : null
  const daysToLeaseEnd = endDate
    ? Math.ceil((endDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6 pt-2 md:pt-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {tenantName(tenant)}</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Your rental overview at a glance.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly rent</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums">
                  {fmtCurrency(Number(tenant.monthly_rent || 0))}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-chart-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">This month</p>
                {thisMonth.data ? (
                  <Badge variant={thisMonth.data.status === "paid" || thisMonth.data.status === "completed" ? "default" : "destructive"}>
                    {thisMonth.data.status}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment due</p>
                )}
                {thisMonth.data && (
                  <p className="text-xs text-muted-foreground mt-1">Due {formatDate(thisMonth.data.due_date)}</p>
                )}
              </div>
              <CalendarClock className="h-6 w-6 text-chart-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Lease ends</p>
                {endDate ? (
                  <>
                    <p className="text-xl md:text-2xl font-bold">{formatDate(tenant.lease_end_date)}</p>
                    {daysToLeaseEnd !== null && daysToLeaseEnd <= 60 && (
                      <p className="text-xs text-destructive">
                        {daysToLeaseEnd < 0
                          ? `${Math.abs(daysToLeaseEnd)} days overdue`
                          : `${daysToLeaseEnd} days left`}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <CalendarClock className="h-6 w-6 text-chart-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Open requests</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums">{maintOpen.count || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">maintenance</p>
              </div>
              <WrenchIconWrap />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property */}
      {property && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-4 w-4" />
              Your Property
            </CardTitle>
            <CardDescription className="text-sm">{property.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Field label="Type" value={property.type} />
              <Field label="Bedrooms" value={property.bedrooms} />
              <Field label="Bathrooms" value={property.bathrooms} />
              <Field label="Location" value={[property.city, property.county].filter(Boolean).join(", ")} />
            </div>
            <Separator className="my-4" />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Field label="Lease start" value={tenant.lease_start_date ? formatDate(tenant.lease_start_date) : "—"} />
              <Field label="Lease end" value={tenant.lease_end_date ? formatDate(tenant.lease_end_date) : "—"} />
              <Field label="Deposit" value={tenant.deposit_amount ? fmtCurrency(Number(tenant.deposit_amount)) : "—"} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription className="text-sm">Your last few rent payments</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/portal/payments">
              All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!recent.data || recent.data.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No payment history yet.
            </div>
          ) : (
            <ul className="divide-y -mx-2">
              {recent.data.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between gap-2 px-2 py-3">
                  <div className="text-sm">
                    <div className="font-medium">{formatDate(p.due_date)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{fmtCurrency(Number(p.amount))}</span>
                    <Badge variant={p.status === "paid" || p.status === "completed" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          href="/portal/maintenance/new"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Report an issue"
          description="Submit a maintenance request"
        />
        <ActionCard
          href="/portal/documents"
          icon={<Home className="h-5 w-5" />}
          title="Lease documents"
          description="View & download your docs"
        />
        <ActionCard
          href="/portal/payments"
          icon={<DollarSign className="h-5 w-5" />}
          title="Payment history"
          description="See all past payments"
        />
      </div>

      {/* Pay rent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pay Rent
          </CardTitle>
          <CardDescription className="text-sm">
            Pay via M-Pesa STK Push. You&apos;ll receive a prompt on your phone to enter your PIN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantPayRent
            tenantId={tenant.id}
            defaultAmount={Number(tenant.monthly_rent || 0)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium capitalize mt-0.5">{value || "—"}</p>
    </div>
  )
}

function WrenchIconWrap() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-chart-2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function ActionCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="block p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="font-medium text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </Link>
  )
}
