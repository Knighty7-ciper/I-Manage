'use client'

import { Button } from "@/components/ui/button"
import { Building2, Users, DollarSign, Wrench, ArrowRight, CheckCircle2, Github, Linkedin } from "lucide-react"
import Link from "next/link"
import { BrandWordmark } from "@/components/brand-mark"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <BrandWordmark href="/" size="md" />
          <div className="flex gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Property management, modernized
                </p>
                <h1 className="text-5xl sm:text-6xl font-bold text-balance">
                  Manage Your <span className="text-primary">Rental Properties</span> with Ease
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Stop juggling spreadsheets and notebooks. I-Manage is the
                  all-in-one platform to manage properties, track tenants,
                  handle maintenance, and understand your finances — built
                  for landlords in Africa and beyond, with native M-Pesa
                  rent collection.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/auth/sign-up" className="gap-2">
                    Start Free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">2,500+</div>
                  <p className="text-sm text-muted-foreground">Active Properties</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">150M+</div>
                  <p className="text-sm text-muted-foreground">In Revenue Tracked</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=500&fit=crop&q=80"
                alt="Property management dashboard showing analytics and property listings"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">Powerful features to streamline your property management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Building2 className="h-10 w-10 text-primary" />}
              title="Manage Properties"
              description="Store all property details in one place. Track rental rates, add photos, list amenities, and manage multiple properties effortlessly."
              image="https://images.unsplash.com/photo-1560518883-4e6f76b60c0c?w=400&h=300&fit=crop&q=80"
              alt="Luxury apartment building exterior"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-secondary" />}
              title="Track Tenants"
              description="Organize tenant information, lease dates, contact details, and payment history. Never lose track of who owes what or when leases end."
              image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80"
              alt="Happy tenants in a modern apartment"
            />
            <FeatureCard
              icon={<DollarSign className="h-10 w-10 text-accent" />}
              title="Financial Insights"
              description="Track rent payments, log expenses, and generate detailed financial reports. Know exactly how much you're earning and spending monthly."
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80"
              alt="Financial charts and business analytics"
            />
            <FeatureCard
              icon={<Wrench className="h-10 w-10 text-primary" />}
              title="Maintenance Tasks"
              description="Schedule and track maintenance requests. Keep all repairs and improvements organized with dates, costs, and completion status."
              image="https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop&q=80"
              alt="Professional handyman doing home repairs"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop&q=80"
                alt="Modern apartment interior showing property management in action"
                className="rounded-xl shadow-xl"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Why Choose I-Manage?</h2>
              <div className="space-y-4">
                {[
                  "One dashboard for all your properties",
                  "Real-time financial reporting and insights",
                  "Native M-Pesa STK Push for rent collection",
                  "Tenant portal — self-service payments, docs, and maintenance",
                  "Automated lease-expiry, document-expiry, and recurring-expense reminders",
                  "Secure data with Supabase RLS and origin-checked APIs",
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Simplify Your Management?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join landlords who&apos;ve transformed their business with I-Manage
            by Siemax Ltd.
          </p>
          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link href="/auth/sign-up" className="gap-2">
              Start Your Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">I-Manage</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  by Siemax Ltd
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                © {new Date().getFullYear()} Siemax Ltd. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Built with care by</span>
              <a
                href="https://www.linkedin.com/in/brian-kiarie-00b3a3391"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                aria-label="Brian Kiarie on LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5" />
                Brian Kiarie
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://github.com/Knighty7-ciper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                aria-label="Brian Kiarie on GitHub"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  image,
  alt,
}: {
  icon: React.ReactNode
  title: string
  description: string
  image: string
  alt: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-8 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
      <img src={image} alt={alt} className="w-full rounded-lg mb-4 h-48 object-cover" />
    </div>
  )
}
