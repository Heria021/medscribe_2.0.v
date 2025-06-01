"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Calendar, FileText, Heart, Mic, History } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProfileCompletion } from "@/components/patient/profile-completion";
import Link from "next/link";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(' ')[0] || 'Patient'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your health records and generate SOAP notes with AI assistance
          </p>
        </div>

        {/* Profile Completion */}
        <ProfileCompletion />

        {/* SOAP Generation Highlight */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Generate SOAP Notes with AI
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 max-w-md">
                  Record your voice or upload audio files to automatically generate structured clinical notes using advanced AI technology.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/patient/soap/history" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-200">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
                <Link href="/patient/soap/generate" className="w-full sm:w-auto">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Mic className="h-4 w-4 mr-2" />
                    Generate SOAP
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/patient/appointments/book">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium text-sm">Book Appointment</h3>
                <p className="text-xs text-muted-foreground mt-1">Schedule with your doctor</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/records">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-sm">Medical Records</h3>
                <p className="text-xs text-muted-foreground mt-1">View your health history</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/health">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-medium text-sm">Health Tracker</h3>
                <p className="text-xs text-muted-foreground mt-1">Monitor vital signs</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/settings/profile">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-medium text-sm">Profile Settings</h3>
                <p className="text-xs text-muted-foreground mt-1">Update your information</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Getting Started Guide */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to make the most of your MedScribe experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Complete Your Profile</h4>
                  <p className="text-xs text-muted-foreground">
                    Add your personal and medical information for better care
                  </p>
                  <Link href="/patient/settings/profile">
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Complete Profile →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <Mic className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Try SOAP Generation</h4>
                  <p className="text-xs text-muted-foreground">
                    Record your voice to generate structured clinical notes
                  </p>
                  <Link href="/patient/soap/generate">
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Generate SOAP →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Book Your First Appointment</h4>
                  <p className="text-xs text-muted-foreground">
                    Schedule a consultation with your healthcare provider
                  </p>
                  <Link href="/patient/appointments/book">
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Book Appointment →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                  <Heart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Start Health Tracking</h4>
                  <p className="text-xs text-muted-foreground">
                    Monitor your vital signs and health metrics
                  </p>
                  <Link href="/patient/health">
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Track Health →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
