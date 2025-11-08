import { Search, ShoppingCart, Menu, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const [cartCount] = useState(3);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="md:hidden"
                  data-testid="button-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <a href="#" className="text-base font-medium hover-elevate rounded-lg px-4 py-3" data-testid="link-dogs">Dogs</a>
                  <a href="#" className="text-base font-medium hover-elevate rounded-lg px-4 py-3" data-testid="link-cats">Cats</a>
                  <a href="#" className="text-base font-medium hover-elevate rounded-lg px-4 py-3" data-testid="link-birds">Birds</a>
                  <a href="#" className="text-base font-medium hover-elevate rounded-lg px-4 py-3" data-testid="link-small-pets">Small Pets</a>
                </nav>
              </SheetContent>
            </Sheet>
            
            <a href="/" className="font-bold text-xl md:text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="link-home">
              ToyPetMe
            </a>
            
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" data-testid="button-nav-dogs">Dogs</Button>
              <Button variant="ghost" size="sm" data-testid="button-nav-cats">Cats</Button>
              <Button variant="ghost" size="sm" data-testid="button-nav-birds">Birds</Button>
              <Button variant="ghost" size="sm" data-testid="button-nav-small-pets">Small Pets</Button>
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for toys..."
                className="pl-9 rounded-full"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="md:hidden"
              data-testid="button-search-mobile"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost"
              data-testid="button-wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost"
              data-testid="button-account"
            >
              <User className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
