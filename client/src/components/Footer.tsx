import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              ToyPetMe
            </h3>
            <p className="text-muted-foreground text-sm">
              Premium pet toys for happy pets and happier owners.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-shop">Shop by Pet</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-dogs">Dogs</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-cats">Cats</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-birds">Birds</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-small-pets">Small Pets</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-links">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-about">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-contact">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-shipping">Shipping Info</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-footer-returns">Returns</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-newsletter">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest deals and pet tips!
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter email" 
                className="rounded-lg"
                data-testid="input-newsletter"
              />
              <Button 
                className="rounded-lg"
                onClick={() => console.log('Newsletter subscribed')}
                data-testid="button-subscribe"
              >
                Join
              </Button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            © 2024 ToyPetMe. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => console.log('Facebook clicked')}
              data-testid="button-facebook"
            >
              <Facebook className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => console.log('Instagram clicked')}
              data-testid="button-instagram"
            >
              <Instagram className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => console.log('Twitter clicked')}
              data-testid="button-twitter"
            >
              <Twitter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
