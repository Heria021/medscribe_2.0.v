"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, AlertCircle } from "lucide-react";
import Link from "next/link";

export function ProfileCompletion({ patientProfile }: { patientProfile: any }) {

  // Show setup prompt if profile does not exist
  if (!patientProfile) {
    return (
      <Card className="border-0 shadow-sm bg-muted">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">Complete Your Profile</h4>
            <p className="text-xs text-muted-foreground">
              Set up your patient profile to get started.
            </p>
          </div>
          <Link href="/patient/settings/profile">
            <Button size="sm">Setup</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion %
  const calculateCompletion = () => {
    const fields = [
      patientProfile.firstName,
      patientProfile.lastName,
      patientProfile.dateOfBirth,
      patientProfile.gender,
      patientProfile.email,
      patientProfile.phone,
      patientProfile.address,
      patientProfile.emergencyContactName,
      patientProfile.emergencyContactPhone,
      patientProfile.bloodGroup,
      patientProfile.preferredLanguage,
    ];

    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isComplete = completionPercentage >= 80;

  if (isComplete) return null;

  return (
    <Card className="border-0 shadow-sm bg-muted">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Profile Completion</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground">
          Complete your profile to unlock all features.
        </p>
        <Link href="/patient/settings/profile">
          <Button size="sm" variant="outline" className="w-full text-sm">
            Complete Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}