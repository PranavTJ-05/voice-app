import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Demo from "@/components/Demo";
import Faq from "@/components/Faq";
import Playground from "@/components/Playground";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="top">
      <Nav />
      <Hero />
      <Demo />
      <Faq />
      <Playground />
      <Footer />
    </main>
  );
}
