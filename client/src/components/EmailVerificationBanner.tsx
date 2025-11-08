import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Mail, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailVerificationBannerProps {
  userEmail: string;
}

export default function EmailVerificationBanner({ userEmail }: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  const resendMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/auth/resend-verification", { email: userEmail }),
    onSuccess: () => {
      toast({
        title: "Email sent!",
        description: "Check your inbox for a new verification link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50" data-testid="banner-verification">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-yellow-800">Email verification required</p>
          <p className="text-sm text-yellow-700">
            Please verify your email address to unlock all features. Check your inbox for the verification link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="whitespace-nowrap"
            data-testid="button-resend-verification"
          >
            <Mail className="mr-1 h-3 w-3" />
            {resendMutation.isPending ? "Sending..." : "Resend"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            data-testid="button-dismiss-banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
