"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOAPGenerateHeaderProps } from "../types";

export function SOAPGenerateHeader({
  patientProfile,
  className,
}: SOAPGenerateHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between",
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Generate SOAP Notes
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Record or upload audio to generate AI-powered clinical documentation
        </p>
      </div>
      
      {patientProfile && (
        <div className="flex-shrink-0">
          <Badge variant="outline" className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Patient:</span>
            <span className="font-medium">
              {patientProfile.firstName} {patientProfile.lastName}
            </span>
          </Badge>
        </div>
      )}
    </div>
  );
}
