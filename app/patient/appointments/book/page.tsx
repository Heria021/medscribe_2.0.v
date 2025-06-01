"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function BookAppointmentPage() {
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
          <h2 className="text-2xl font-bold tracking-tight">Book Appointment</h2>
          <p className="text-muted-foreground">
            Schedule an appointment with your healthcare provider
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Appointment Booking</CardTitle>
            <CardDescription>
              This feature is coming soon! You'll be able to book appointments with doctors directly from here.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Choose Time Slots</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <User className="h-5 w-5" />
                <span>Select Doctor</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Pick Location</span>
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
