import LoginForm from "@/components/login-form"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
