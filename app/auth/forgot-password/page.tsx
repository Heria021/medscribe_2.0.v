"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Reset link sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md shadow-lg border-0 bg-card">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Check Your Email</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              We've sent a password reset link to your email address if an account exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Try Again
              </Button>
            </div>

            <div className="pt-4 border-t border-border text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Forgot Password?</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </Form>

          <div className="pt-4 border-t border-border text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
