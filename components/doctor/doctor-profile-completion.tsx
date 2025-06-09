"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, Stethoscope, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DoctorProfileCompletion({ doctorProfile }: { doctorProfile: any }) {
  // Show setup prompt if profile does not exist
  if (!doctorProfile) {
    return (
      <Card className="border bg-muted/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">Set Up Your Doctor Profile</h4>
            <p className="text-xs text-muted-foreground">
              Create your professional profile to start accepting patients.
            </p>
          </div>
          <Link href="/doctor/settings/profile">
            <Button size="sm" className="flex items-center gap-1">
              Get Started
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Define required and optional fields for logical completion
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'primarySpecialty', label: 'Primary Specialty' },
    { key: 'licenseNumber', label: 'License Number' },
  ];

  const professionalFields = [
    { key: 'npiNumber', label: 'NPI Number' },
    { key: 'deaNumber', label: 'DEA Number' },
    { key: 'boardCertifications', label: 'Board Certifications' },
    { key: 'medicalSchool', label: 'Medical School' },
    { key: 'yearsOfExperience', label: 'Years of Experience' },
  ];

  const practiceFields = [
    { key: 'practiceName', label: 'Practice Name' },
    { key: 'consultationFee', label: 'Consultation Fee' },
    { key: 'availabilitySchedule', label: 'Availability Schedule' },
    { key: 'languagesSpoken', label: 'Languages Spoken' },
    { key: 'bio', label: 'Professional Bio' },
  ];

  // Calculate completion based on required fields
  const completedRequired = requiredFields.filter(field => {
    const value = doctorProfile[field.key];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
  });

  const completedProfessional = professionalFields.filter(field => {
    const value = doctorProfile[field.key];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
  });

  const completedPractice = practiceFields.filter(field => {
    const value = doctorProfile[field.key];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
  });

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;

  // Profile is considered complete when all required fields are filled
  const isComplete = completedRequired.length === requiredFields.length;

  // Don't show if profile is complete
  if (isComplete) return null;

  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <Card className="border bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Stethoscope className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Complete Your Doctor Profile</CardTitle>
              <p className="text-xs text-muted-foreground">
                {missingRequired} required field{missingRequired !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {Math.round(requiredCompletion)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Required Fields</span>
            <span className="font-medium">{completedRequired.length}/{requiredFields.length}</span>
          </div>
          <Progress value={requiredCompletion} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Complete all required fields to start accepting patients and unlock full platform features.
          </p>
          <Link href="/doctor/settings/profile">
            <Button size="sm" variant="outline" className="w-full text-sm flex items-center gap-1">
              Complete Profile
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}