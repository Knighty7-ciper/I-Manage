import { SimpleMarketingPage } from "@/components/marketing-site"

export const metadata = { title: "About" }

export default function AboutPage() {
  return (
    <SimpleMarketingPage
      title="Better property operations begin with better tools."
      intro="I-Manage is built by Siemax Ltd for property owners and teams who want to make thoughtful, informed decisions as they grow."
      sectionTitle="Built for the work behind the portfolio."
      sectionBody="We believe the best property technology removes friction from everyday work, so owners can focus on the homes, people and returns that matter most."
    />
  )
}
