import { Link } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/lib/usePageMeta";

export default function CheckoutCancel() {
  usePageMeta({
    title: "Checkout Cancelled",
    description: "Your payment was cancelled. No charges were made.",
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center text-center gap-4 py-10 px-6">
          <div className="rounded-full bg-muted p-4">
            <XCircle size={40} className="text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Payment cancelled</h1>
          <p className="text-sm text-muted-foreground">
            No problem — you haven't been charged anything. You can return to the shop whenever you're ready.
          </p>
          <div className="flex gap-3 w-full">
            <Link href="/shop" className="flex-1">
              <Button className="w-full" data-testid="button-back-to-shop">Back to Shop</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full" data-testid="button-back-to-game">Back to Game</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
