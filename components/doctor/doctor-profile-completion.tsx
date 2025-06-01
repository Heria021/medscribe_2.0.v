"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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

export function DoctorProfileCompletion() {
  const { data: session } = useSession();
  const [profileSteps, setProfileSteps] = useState<ProfileCompletionStep[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch profile completion status from Convex
  const profileStatus = useQuery(
    api.doctors.isDoctorProfileComplete,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  useEffect(() => {
    if (profileStatus) {
      const steps: ProfileCompletionStep[] = [
        {
          id: "personal",
          title: "Personal Information",
          description: "Complete your basic personal details",
          icon: User,
          completed: profileStatus.completedSteps.includes("personal"),
          required: true,
        },
        {
          id: "professional",
          title: "Professional Credentials",
          description: "Add your medical license and specialization",
          icon: Stethoscope,
          completed: profileStatus.completedSteps.includes("professional"),
          required: true,
        },
        {
          id: "availability",
          title: "Availability Schedule",
          description: "Set your working hours and availability",
          icon: Clock,
          completed: profileStatus.completedSteps.includes("availability"),
          required: false,
        },
        {
          id: "billing",
          title: "Billing Information",
          description: "Configure your consultation fees",
          icon: DollarSign,
          completed: profileStatus.completedSteps.includes("billing"),
          required: false,
        },
      ];

      setProfileSteps(steps);
      setCompletionPercentage(profileStatus.completionPercentage);
    }
  }, [profileStatus]);

  const requiredSteps = profileSteps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed);
  const isProfileComplete = completedRequiredSteps.length === requiredSteps.length;

  if (isProfileComplete) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Profile Complete!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your doctor profile is fully set up and ready for patients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Complete Your Doctor Profile
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                {completedRequiredSteps.length} of {requiredSteps.length} required steps completed
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            {Math.round(completionPercentage)}% Complete
          </Badge>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-2 bg-amber-200 dark:bg-amber-800"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {profileSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                step.completed
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  step.completed
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-muted"
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{step.title}</h4>
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
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                >
                  <Link href="/doctor/settings/profile" className="flex items-center gap-1">
                    Complete
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
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
