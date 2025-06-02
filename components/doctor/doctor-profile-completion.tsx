"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
  Clock,
  DollarSign,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface ProfileCompletionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  required: boolean;
}

export function DoctorProfileCompletion({ doctorProfile }: { doctorProfile: any }) {
  const [profileSteps, setProfileSteps] = useState<ProfileCompletionStep[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (doctorProfile) {
      const steps: ProfileCompletionStep[] = [
        {
          id: "personal",
          title: "Personal Information",
          description: "Complete your basic personal details",
          icon: User,
          completed: doctorProfile.personalInfoCompleted,
          required: true,
        },
        {
          id: "professional",
          title: "Professional Credentials",
          description: "Add your medical license and specialization",
          icon: Stethoscope,
          completed: doctorProfile.professionalInfoCompleted,
          required: true,
        },
        {
          id: "availability",
          title: "Availability Schedule",
          description: "Set your working hours and availability",
          icon: Clock,
          completed: doctorProfile.availabilityInfoCompleted,
          required: false,
        },
        {
          id: "billing",
          title: "Billing Information",
          description: "Configure your consultation fees",
          icon: DollarSign,
          completed: doctorProfile.billingInfoCompleted,
          required: false,
        },
      ];

      setProfileSteps(steps);
      setCompletionPercentage(doctorProfile.completionPercentage);
    }
  }, [doctorProfile]);

  const requiredSteps = profileSteps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed);
  const isProfileComplete = completedRequiredSteps.length === requiredSteps.length;

  if (isProfileComplete) {
    return (
      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Profile Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Your doctor profile is fully set up and ready for patients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/40 border shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground">
                Complete Your Doctor Profile
              </CardTitle>
              <CardDescription>
                {completedRequiredSteps.length} of {requiredSteps.length} required steps completed
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">
            {Math.round(completionPercentage)}% Complete
          </Badge>
        </div>
        <Progress value={completionPercentage} />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {profileSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                step.completed
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-background border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  step.completed ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground">{step.title}</h4>
                    {step.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {!step.completed && (
                <Button asChild variant="ghost" size="sm" className="h-8 px-3">
                  <Link href="/doctor/settings/profile" className="flex items-center gap-1">
                    Complete
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Complete your profile to start accepting patients
          </p>
          <Button asChild className="flex items-center gap-2">
            <Link href="/doctor/settings/profile">
              Continue Setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}