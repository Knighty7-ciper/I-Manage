import { SimpleMarketingPage } from "@/components/marketing-site"

export const metadata = { title: "Platform" }

export default function PlatformPage() {
  return (
    <SimpleMarketingPage
      title="One place to run every property operation."
      intro="I-Manage connects your portfolio, cashflow, maintenance and documents in a single workspace built for growing property businesses."
      sectionTitle="Clarity for every decision."
      sectionBody="See what needs attention, understand performance across your portfolio and keep your entire team working from the same live operational record."
    />
  )
}
