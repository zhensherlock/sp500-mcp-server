"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import QuickStart from "@/components/QuickStart";
import FeaturesSection from "@/components/FeaturesSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />

        <FeaturesSection />

        <QuickStart />
      </main>
      <Footer />
    </>
  );
}
