import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Demo from "@/components/Demo";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Playground from "@/components/Playground";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="top">
      <Nav />
      <Hero />
      <Demo />
      <Features />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <Faq />
      <Playground />
      <Footer />
    </main>
  );
}
