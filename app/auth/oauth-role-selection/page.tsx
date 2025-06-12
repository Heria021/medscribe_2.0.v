"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserCheck, Stethoscope, Loader2, ArrowRight } from "lucide-react";
import { useMutation } from "convex/react";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { selectRoleSchema, type SelectRoleFormData } from "@/lib/validations/auth";
import { api } from "@/convex/_generated/api";
import { ThemeToggle } from "@/components/theme-toggle";

function OAuthRoleSelectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Try to get data from session first, then fallback to URL params
  const email = session?.user?.oauthData?.email || searchParams.get("email");
  const name = session?.user?.oauthData?.name || searchParams.get("name");
  const image = session?.user?.oauthData?.image || searchParams.get("image");
  const provider = session?.user?.oauthData?.provider || searchParams.get("provider");
  const providerId = session?.user?.oauthData?.providerId || searchParams.get("providerId");

  const createOAuthUser = useMutation(api.users.createOAuthUser);

  const form = useForm<SelectRoleFormData>({
    resolver: zodResolver(selectRoleSchema),
  });

  // Redirect if missing required parameters
  useEffect(() => {
    if (!email || !provider || !providerId) {
      router.push("/auth/login");
    }
  }, [email, provider, providerId, router]);

  const onSubmit = async (data: SelectRoleFormData) => {
    if (!email || !provider || !providerId) {
      toast({
        title: "Error",
        description: "Missing required information. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create OAuth user in Convex
      await createOAuthUser({
        email,
        role: data.role,
        provider,
        providerId,
        name: name || undefined,
        image: image || undefined,
      });

      toast({
        title: "Account created successfully!",
        description: `Welcome to MedScribe! You're registered as a ${data.role}.`,
      });

      // Sign out and sign back in to refresh the session with the new role
      await signOut({ redirect: false });

      // Small delay to ensure sign out completes
      setTimeout(() => {
        // Redirect to login with a success message
        router.push("/auth/login?message=account-created");
      }, 1000);
    } catch (error: any) {
      console.error("OAuth registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = form.watch("role");

  if (!email || !provider || !providerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/40 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
              <div className="text-2xl font-bold text-primary">M</div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">Complete Your Registration</CardTitle>
              <CardDescription className="text-muted-foreground">
                Welcome {name}! Choose your role to get started
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="relative">
                            <RadioGroupItem
                              value="doctor"
                              id="doctor"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="doctor"
                              className={`
                                group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                                ${selectedRole === "doctor"
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-border/40 bg-background/50 hover:bg-muted/30 hover:border-border"
                                }
                              `}
                            >
                              <div className={`
                                flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                                ${selectedRole === "doctor"
                                  ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-200 dark:ring-blue-800"
                                  : "bg-blue-50 dark:bg-blue-950/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"
                                }
                              `}>
                                <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="text-base font-semibold text-foreground">Doctor</div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  Manage patients, consultations, and medical records
                                </div>
                              </div>
                              {selectedRole === "doctor" && (
                                <ArrowRight className="h-5 w-5 text-primary" />
                              )}
                            </Label>
                          </div>

                          <div className="relative">
                            <RadioGroupItem
                              value="patient"
                              id="patient"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="patient"
                              className={`
                                group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                                ${selectedRole === "patient"
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-border/40 bg-background/50 hover:bg-muted/30 hover:border-border"
                                }
                              `}
                            >
                              <div className={`
                                flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                                ${selectedRole === "patient"
                                  ? "bg-emerald-100 dark:bg-emerald-900/50 ring-2 ring-emerald-200 dark:ring-emerald-800"
                                  : "bg-emerald-50 dark:bg-emerald-950/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50"
                                }
                              `}>
                                <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="text-base font-semibold text-foreground">Patient</div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  Access your medical records and appointments
                                </div>
                              </div>
                              {selectedRole === "patient" && (
                                <ArrowRight className="h-5 w-5 text-primary" />
                              )}
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OAuthRoleSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <OAuthRoleSelectionForm />
    </Suspense>
  );
}
