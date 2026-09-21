import { DocSidebar } from "@/components/docs/doc-sidebar"
import { Hero } from "@/components/docs/hero"
import { SiteFooter } from "@/components/docs/site-footer"
import { SiteHeader } from "@/components/docs/site-header"
import {
  AttSection,
  BannerSection,
  ConsentSection,
  FeaturesSection,
  InstallationSection,
  InterstitialSection,
  QuickStartSection,
  RewardedSection,
} from "@/components/docs/sections-guide"
import {
  ApiReferenceSection,
  DesktopSection,
  ErrorsSection,
  EventsSection,
  FaqSection,
  LimitationsSection,
  TestingSection,
  TypesSection,
} from "@/components/docs/sections-reference"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Hero />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-start px-4 sm:px-6 lg:px-8">
        <DocSidebar />
        <main className="min-w-0 flex-1 divide-y divide-border/50 lg:max-w-3xl lg:pl-2 xl:pl-6">
          <FeaturesSection />
          <InstallationSection />
          <QuickStartSection />
          <ConsentSection />
          <AttSection />
          <BannerSection />
          <InterstitialSection />
          <RewardedSection />
          <EventsSection />
          <ApiReferenceSection />
          <TypesSection />
          <ErrorsSection />
          <TestingSection />
          <DesktopSection />
          <FaqSection />
          <LimitationsSection />
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
