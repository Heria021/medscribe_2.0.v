"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, Loader2, UserCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, type RegisterFormData, type UserRole } from "@/lib/validations/auth";
import { api } from "@/convex/_generated/api";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const createUser = useMutation(api.users.createUser);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Get the selected role from localStorage
    const role = localStorage.getItem("selectedRole") as UserRole;
    if (role) {
      setSelectedRole(role);
      form.setValue("role", role);
    } else {
      // If no role selected, redirect to role selection
      router.push("/auth/select-role");
    }
  }, [form, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user in Convex
      const userId = await createUser({
        email: data.email,
        passwordHash,
        role: data.role,
      });

      // If user is a patient, create a basic patient profile
      if (data.role === "patient") {
        // Create basic patient profile with default values
        await fetch("/api/patient/create-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            // Default values - user can update these later
            dateOfBirth: "1990-01-01",
            gender: "M",
            primaryPhone: "000-000-0000",
            addressLine1: "To be updated",
            city: "To be updated",
            state: "To be updated",
            zipCode: "00000",
            country: "USA",
            emergencyContactName: "To be updated",
            emergencyContactPhone: "000-000-0000",
            emergencyContactRelation: "To be updated",
          }),
        });
      }

      // Send welcome email
      try {
        await fetch("/api/auth/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            firstName: data.firstName,
            role: data.role,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail registration if email fails
      }

      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      });

      // Clear the stored role
      localStorage.removeItem("selectedRole");

      // Redirect to login
      router.push("/auth/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return null; // Will redirect to role selection
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/40 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex items-center justify-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
                selectedRole === "doctor" 
                  ? "bg-blue-50 dark:bg-blue-950/50 ring-blue-200 dark:ring-blue-800" 
                  : "bg-emerald-50 dark:bg-emerald-950/50 ring-emerald-200 dark:ring-emerald-800"
              }`}>
                {selectedRole === "doctor" ? (
                  <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <Badge variant="secondary" className="text-xs font-medium capitalize px-3 py-1">
                {selectedRole}
              </Badge>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details to create your {selectedRole} account
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground">First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="First name"
                            className="h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Last name"
                            className="h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20 pr-11"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 w-11 p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20 pr-11"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 w-11 p-0 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Already have an account?{" "}
                  <span className="text-primary hover:text-primary/80 font-medium">Sign in</span>
                </Link>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/select-role"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change role
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}