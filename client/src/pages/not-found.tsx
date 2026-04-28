import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/lib/usePageMeta";

export default function NotFound() {
  usePageMeta({
    title: "Page Not Found",
    description: "The page you were looking for doesn't exist. Head back to ToyPetMe and keep caring for your virtual pet!",
    canonicalPath: "/",
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-black text-violet-400 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Page Not Found</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          This page doesn't exist. Your pet is waiting for you — head back to the game!
        </p>
        <Link href="/">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8" data-testid="button-go-home">
            Back to ToyPetMe
          </Button>
        </Link>
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <span className="opacity-30">·</span>
          <Link href="/minigames" className="hover:text-foreground transition-colors">Mini Games</Link>
          <span className="opacity-30">·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
