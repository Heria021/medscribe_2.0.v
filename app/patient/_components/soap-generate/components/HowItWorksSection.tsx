"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { HowItWorksSectionProps } from "../types";

const steps = [
  {
    number: 1,
    title: "Audio Processing",
    description: "Advanced speech-to-text conversion with medical terminology recognition"
  },
  {
    number: 2,
    title: "Medical Analysis",
    description: "AI categorizes clinical information using medical knowledge"
  },
  {
    number: 3,
    title: "SOAP Structure",
    description: "Organizes content into Subjective, Objective, Assessment, Plan format"
  },
  {
    number: 4,
    title: "Quality Assurance",
    description: "Validates accuracy and completeness of clinical documentation"
  }
];

export function HowItWorksSection({
  className,
}: HowItWorksSectionProps) {
  return (
    <Card className={cn("border w-full", className)}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          How SOAP Generation Works
        </CardTitle>
        <CardDescription className="text-sm">
          Our AI-powered system transforms your audio into structured clinical documentation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div 
              key={step.number}
              className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg bg-muted/50"
            >
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                {step.number}
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
