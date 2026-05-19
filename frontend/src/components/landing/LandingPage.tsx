import LandingHero from "@/components/landing/LandingHero";
import DashboardPreviewMock from "@/components/landing/DashboardPreviewMock";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import LandingCta from "@/components/landing/LandingCta";

export default function LandingPage() {
  return (
    <div className="-mx-4 -mt-8">
      <LandingHero />
      <DashboardPreviewMock />
      <FeaturesGrid />
      <LandingCta />
    </div>
  );
}
