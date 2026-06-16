import type { Metadata } from "next";
import HomeNav from "@/components/home/HomeNav";
import HomePreloader from "@/components/home/HomePreloader";
import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import Engineer from "@/components/home/Engineer";
import HowItWorks from "@/components/home/HowItWorks";
import WhyZnas from "@/components/home/WhyZnas";
import CaseStudies from "@/components/home/CaseStudies";
import CreatedByZnas from "@/components/home/CreatedByZnas";
import Quotes from "@/components/home/Quotes";
import ScopingCall from "@/components/home/ScopingCall";
import Faq from "@/components/home/Faq";
import SiteFooter from "@/components/layout/SiteFooter";
import { personOrgJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "ZNAS LLC | Forward Deployed AI Engineering",
  description:
    "ZNAS is a Forward Deployed AI Engineering firm. I embed with your team, build the AI system in your actual operation, and own the outcome until it runs.",
};

export default function Home() {
  return (
    <div className="fde">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personOrgJsonLd) }}
      />
      <HomePreloader />
      <HomeNav />
      <main>
        <Hero />
        <Problem />
        <Engineer />
        <HowItWorks />
        <WhyZnas />
        <CaseStudies />
        <CreatedByZnas />
        <Quotes />
        <ScopingCall />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
