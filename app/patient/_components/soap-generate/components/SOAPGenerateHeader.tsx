/**
 * SOAP Generate Header Component
 * Compact header for the SOAP generation page
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  User,
  Calendar,
  Hash
} from "lucide-react";

import { SOAPGenerateHeaderProps } from "../types";

export function SOAPGenerateHeader({
  patientProfile,
  className,
}: SOAPGenerateHeaderProps) {
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">SOAP Generation</h1>
            <p className="text-muted-foreground">
              AI-powered clinical documentation
            </p>
          </div>
        </div>
        
        <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Enhanced AI
        </Badge>
      </div>


    </div>
  );
}
