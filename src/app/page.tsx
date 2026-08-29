import { CtaBanner } from "@/components/home/cta-banner";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsBar } from "@/components/home/stats-bar";
import { ValueProps } from "@/components/home/value-props";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedCourses />
      <HowItWorks />
      <ValueProps />
      <CtaBanner />
      <Footer />
    </>
  );
}
