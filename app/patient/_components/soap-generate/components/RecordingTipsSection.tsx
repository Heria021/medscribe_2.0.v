"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecordingTipsSectionProps } from "../types";

export function RecordingTipsSection({
  className,
}: RecordingTipsSectionProps) {
  return (
    <Card className={cn("border w-full flex flex-col h-full", className)}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          Recording Tips
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4 text-sm h-full flex flex-col justify-center">
          <div className="space-y-2">
            <h4 className="font-medium text-sm sm:text-base">For Best Results:</h4>
            <ul className="space-y-1 text-muted-foreground text-xs sm:text-sm">
              <li>• Speak clearly and at a moderate pace</li>
              <li>• Use medical terminology when appropriate</li>
              <li>• Include patient symptoms, observations, and plans</li>
              <li>• Minimize background noise</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm sm:text-base">Supported Formats:</h4>
            <ul className="space-y-1 text-muted-foreground text-xs sm:text-sm">
              <li>• Audio recordings up to 10 minutes</li>
              <li>• MP3, WAV, M4A, WebM formats</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Clear audio quality recommended</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
