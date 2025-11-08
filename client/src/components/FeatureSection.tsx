import { Card } from "@/components/ui/card";
import { Truck, Shield, Heart, Sparkles } from "lucide-react";

const features = [
  {
    id: 1,
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50",
  },
  {
    id: 2,
    icon: Shield,
    title: "Safe & Tested",
    description: "All toys are pet-safe certified",
  },
  {
    id: 3,
    icon: Heart,
    title: "Pet Approved",
    description: "Loved by pets everywhere",
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Premium Quality",
    description: "Durable and long-lasting",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 
          className="text-3xl md:text-4xl font-semibold text-center mb-12" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
          data-testid="text-features-title"
        >
          Why Choose ToyPetMe?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.id} className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-feature-title-${feature.id}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-feature-desc-${feature.id}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
