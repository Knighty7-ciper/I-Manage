"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Forward to whatever observability stack you wire up later
    // (Sentry, PostHog, etc.). For now: console only.
    console.error("[i-manage] route error", { message: error.message, digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error stopped this page from loading. We've logged the details.
          </CardDescription>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono break-all">Error ID: {error.digest}</p>
          )}
        </CardHeader>
        <CardContent className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => reset()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
