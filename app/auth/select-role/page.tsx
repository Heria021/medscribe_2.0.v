"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserCheck, Stethoscope, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { selectRoleSchema, type SelectRoleFormData } from "@/lib/validations/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SelectRolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SelectRoleFormData>({
    resolver: zodResolver(selectRoleSchema),
  });

  const onSubmit = async (data: SelectRoleFormData) => {
    setIsLoading(true);

    // Store the selected role in localStorage for the registration process
    localStorage.setItem("selectedRole", data.role);

    // Redirect to registration page
    router.push("/auth/register");

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome to MedScribe</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Please select your role to continue
          </CardDescription>
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
                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-background hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all cursor-pointer"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                              <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium leading-none">Doctor</div>
                              <div className="text-xs text-muted-foreground leading-tight">
                                Access patient records and manage consultations
                              </div>
                            </div>
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
                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-background hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all cursor-pointer"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium leading-none">Patient</div>
                              <div className="text-xs text-muted-foreground leading-tight">
                                View your medical records and appointments
                              </div>
                            </div>
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
                className="w-full h-10 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
