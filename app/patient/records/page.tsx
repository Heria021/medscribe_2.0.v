"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function MedicalRecordsPage() {
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
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              Medical Records
            </h1>
            <p className="text-muted-foreground text-sm">
              View and manage your medical records and documents
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 space-y-6">
          {/* Coming Soon Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Medical Records</CardTitle>
              <CardDescription>
                This feature is coming soon! You'll be able to view all your medical records, test results, and documents here.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>View Records</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Download className="h-5 w-5" />
                  <span>Download Files</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Track History</span>
                </div>
              </div>
              <Button disabled className="mt-6">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
