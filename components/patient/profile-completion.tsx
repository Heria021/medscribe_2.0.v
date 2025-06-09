"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProfileCompletion({ patientProfile }: { patientProfile: any }) {
  // Show setup prompt if profile does not exist
  if (!patientProfile) {
    return (
      <Card className="border bg-muted/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">Complete Your Profile</h4>
            <p className="text-xs text-muted-foreground">
              Set up your patient profile to get started.
            </p>
          </div>
          <Link href="/patient/settings/profile">
            <Button size="sm" className="flex items-center gap-1">
              Setup
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
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'email', label: 'Email' },
    { key: 'primaryPhone', label: 'Phone Number' },
    { key: 'addressLine1', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zipCode', label: 'ZIP Code' },
    { key: 'emergencyContactName', label: 'Emergency Contact' },
    { key: 'emergencyContactPhone', label: 'Emergency Phone' },
  ];

  const optionalFields = [
    { key: 'country', label: 'Country' },
    { key: 'emergencyContactRelation', label: 'Emergency Relation' },
    { key: 'bloodType', label: 'Blood Type' },
    { key: 'preferredLanguage', label: 'Preferred Language' },
    { key: 'secondaryPhone', label: 'Secondary Phone' },
    { key: 'addressLine2', label: 'Address Line 2' },
  ];

  // Calculate completion based on required fields
  const completedRequired = requiredFields.filter(field =>
    patientProfile[field.key] && patientProfile[field.key].toString().trim() !== ""
  );

  const completedOptional = optionalFields.filter(field =>
    patientProfile[field.key] && patientProfile[field.key].toString().trim() !== ""
  );

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const totalCompletion = ((completedRequired.length + completedOptional.length) / (requiredFields.length + optionalFields.length)) * 100;

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
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Complete Your Profile</CardTitle>
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
            Complete all required fields to unlock full platform features.
          </p>
          <Link href="/patient/settings/profile">
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