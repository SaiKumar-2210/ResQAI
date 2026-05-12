import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { DemoScenarios } from "@/components/landing/DemoScenarios";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <DemoScenarios />
      <Footer />
    </main>
  );
}
