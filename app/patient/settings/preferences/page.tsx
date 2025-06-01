"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, Palette } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Preferences</h2>
          <p className="text-muted-foreground">
            Customize your app settings and preferences
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">App Preferences</CardTitle>
            <CardDescription>
              This feature is coming soon! You'll be able to customize notifications, themes, privacy settings, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Palette className="h-5 w-5" />
                <span>Theme Settings</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Controls</span>
              </div>
            </div>
            <Button disabled className="mt-6">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
