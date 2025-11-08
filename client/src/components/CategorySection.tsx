import { Card } from "@/components/ui/card";
import { Dog, Cat, Bird, Rabbit } from "lucide-react";

const categories = [
  { id: 1, name: "Dogs", icon: Dog, color: "text-primary" },
  { id: 2, name: "Cats", icon: Cat, color: "text-chart-2" },
  { id: 3, name: "Birds", icon: Bird, color: "text-chart-3" },
  { id: 4, name: "Small Pets", icon: Rabbit, color: "text-chart-4" },
];

export default function CategorySection() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 
          className="text-3xl md:text-4xl font-semibold text-center mb-12" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
          data-testid="text-category-title"
        >
          Shop by Pet Type
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="p-6 flex flex-col items-center justify-center gap-4 hover-elevate active-elevate-2 cursor-pointer transition-transform duration-200"
              onClick={() => console.log(`${category.name} category clicked`)}
              data-testid={`card-category-${category.name.toLowerCase().replace(' ', '-')}`}
            >
              <category.icon className={`w-12 h-12 ${category.color}`} />
              <h3 className="text-xl font-semibold text-center" data-testid={`text-category-${category.name.toLowerCase().replace(' ', '-')}`}>
                {category.name}
              </h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
