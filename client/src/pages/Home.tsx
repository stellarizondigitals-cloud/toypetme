import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import ProductGrid from "@/components/ProductGrid";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Hero />
        <CategorySection />
        <ProductGrid />
        <FeatureSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
