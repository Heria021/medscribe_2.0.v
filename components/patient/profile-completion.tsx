"use client";

import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";

export function ProfileCompletion() {
  const { data: session } = useSession();
  
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  if (!patientProfile) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <h4 className="font-medium">Complete Your Profile</h4>
              <p className="text-sm text-muted-foreground">
                Set up your patient profile to get started
              </p>
            </div>
            <Link href="/patient/settings/profile">
              <Button size="sm">Setup Profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion percentage
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

    const filledFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isComplete = completionPercentage >= 80; // Consider 80% as "complete"

  if(isComplete){
    return null;
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle className="text-base">Profile Completion</CardTitle>
          </div>
          <Badge 
            variant={isComplete ? "default" : "secondary"}
            className="text-xs"
          >
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {isComplete ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Profile completed!</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Complete your profile to unlock all features
            </p>
            <Link href="/patient/settings/profile">
              <Button size="sm" variant="outline" className="w-full">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
