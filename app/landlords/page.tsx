import { SimpleMarketingPage } from "@/components/marketing-site"

export const metadata = { title: "For landlords" }

export default function LandlordsPage() {
  return (
    <SimpleMarketingPage
      title="Property ownership, run with intention."
      intro="Build a stronger operation around your properties, without adding unnecessary admin to your day."
      sectionTitle="Your portfolio deserves a proper operating system."
      sectionBody="I-Manage puts rent collection, expenses, tenants, maintenance requests and important documents into the same clear, accountable workflow."
    />
  )
}
