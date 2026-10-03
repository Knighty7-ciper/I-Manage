import { SimpleMarketingPage } from "@/components/marketing-site"

export const metadata = { title: "Resources" }

export default function ResourcesPage() {
  return (
    <SimpleMarketingPage
      title="Ideas for a better-run property business."
      intro="Practical guidance for landlords and teams building calm, reliable operations around their portfolios."
      sectionTitle="Make every move more informed."
      sectionBody="Explore the principles behind stronger rental operations, from cashflow visibility and tenant communication to planned maintenance and document control."
    />
  )
}
