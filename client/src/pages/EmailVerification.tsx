import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/verify");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-purple-50 to-pink-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-purple-500 animate-spin" data-testid="icon-loading" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" data-testid="icon-success" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" data-testid="icon-error" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription data-testid="text-message">
            {status === "loading" && "Please wait while we verify your email address..."}
            {status === "success" && message}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "success" && (
            <Button
              onClick={() => setLocation("/login")}
              className="w-full"
              data-testid="button-login"
            >
              Go to Login
            </Button>
          )}
          {status === "error" && (
            <>
              <Button
                onClick={() => setLocation("/signup")}
                className="w-full"
                data-testid="button-signup"
              >
                Sign Up Again
              </Button>
              <Button
                onClick={() => setLocation("/login")}
                variant="outline"
                className="w-full"
                data-testid="button-login"
              >
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
