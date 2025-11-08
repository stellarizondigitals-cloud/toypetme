import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Happy_pets_playing_with_toys_96f51229.png";

export default function Hero() {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-2xl">
          <h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6" 
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="text-hero-title"
          >
            Happy Pets, Happy Life
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed" data-testid="text-hero-subtitle">
            Discover premium toys that bring joy to your furry friends. Safe, durable, and designed for endless fun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="px-8 py-6 text-base font-semibold rounded-lg"
              data-testid="button-shop-now"
              onClick={() => console.log('Shop Now clicked')}
            >
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-base font-semibold rounded-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              data-testid="button-learn-more"
              onClick={() => console.log('Learn More clicked')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
