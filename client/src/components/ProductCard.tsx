import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  isNew?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  rating,
  reviews,
  category,
  isNew = false,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className="overflow-hidden hover-elevate transition-transform duration-200">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${id}`}
        />
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white ${isFavorite ? 'text-destructive' : ''}`}
          onClick={() => {
            setIsFavorite(!isFavorite);
            console.log(`Product ${id} favorite toggled: ${!isFavorite}`);
          }}
          data-testid={`button-favorite-${id}`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
        {isNew && (
          <Badge className="absolute top-2 left-2" data-testid={`badge-new-${id}`}>
            New
          </Badge>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground" data-testid={`text-category-${id}`}>
            {category}
          </p>
          <h3 className="text-xl font-semibold mt-1" data-testid={`text-name-${id}`}>
            {name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-chart-4 text-chart-4' : 'text-muted'}`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1" data-testid={`text-reviews-${id}`}>
            ({reviews})
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-2xl font-bold" data-testid={`text-price-${id}`}>
            ${price.toFixed(2)}
          </p>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => console.log(`Product ${id} added to cart`)}
            data-testid={`button-add-cart-${id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
