import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Home, DollarSign, FileText, Wrench, LogOut } from "lucide-react"
import { signOut } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BrandWordmark } from "@/components/brand-mark"

const portalNav = [
  { name: "Overview", href: "/portal", icon: Home },
  { name: "Payments", href: "/portal/payments", icon: DollarSign },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Maintenance", href: "/portal/maintenance", icon: Wrench },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?next=/portal")

  // Resolve the tenant link. If none, redirect to a "not a tenant" page.
  const { data: link } = await supabase
    .from("tenant_users")
    .select("tenant_id, tenants(id, full_name, first_name, last_name, status, properties(name))")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Home className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">No tenant access</h1>
          <p className="text-sm text-muted-foreground">
            Your account isn&apos;t linked to any tenant record. Ask your
            landlord to invite you, then return to this page.
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const tenantName =
    (link as any).tenants?.full_name ||
    [(link as any).tenants?.first_name, (link as any).tenants?.last_name].filter(Boolean).join(" ") ||
    user.email
  const propertyName = (link as any).tenants?.properties?.name
  const tenantStatus = (link as any).tenants?.status

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/portal" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandWordmark size="sm" showSubtitle={false} />
            <div className="hidden sm:block ml-2">
              <div className="font-semibold text-sm leading-tight">Tenant Portal</div>
              {propertyName && (
                <div className="text-xs text-muted-foreground">{propertyName}</div>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium truncate max-w-[180px]">{tenantName}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
            </div>
            {tenantStatus && (
              <Badge variant={tenantStatus === "active" ? "default" : "secondary"} className="capitalize">
                {tenantStatus}
              </Badge>
            )}
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile-friendly tab nav */}
        <nav className="md:hidden border-t overflow-x-auto">
          <div className="flex gap-1 px-2 py-1 min-w-max">
            {portalNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground whitespace-nowrap"
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 border-r p-3">
          <nav className="space-y-1">
            {portalNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <n.icon className="h-4 w-4" />
                {n.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t bg-card/30">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-[11px] text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">I-Manage</span>
            <span className="mx-1.5 opacity-60">·</span>
            by Siemax Ltd
          </p>
          <p>
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/brian-kiarie-00b3a3391"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline-offset-2 hover:underline"
            >
              Brian Kiarie
            </a>
            {" · "}
            <a
              href="https://github.com/Knighty7-ciper"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline-offset-2 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
