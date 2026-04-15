import { Link } from "wouter";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/80 py-4 px-4 mt-2 pb-24">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <span className="opacity-30">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <span className="opacity-30">·</span>
          <a href="https://stellarizondigitals.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Stellarizon Digitals</a>
          <span className="opacity-30">·</span>
          <a href="mailto:legal@stellarizondigitals.com" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          © {year} Stellarizon Digitals. ToyPetMe is free to play. Game progress is saved in your browser only.
        </p>
        <p className="text-[10px] text-muted-foreground/50">
          Ads served by Google AdSense. By using this site you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-muted-foreground/80">Privacy Policy</Link>.
        </p>
      </div>
    </footer>
  );
}
