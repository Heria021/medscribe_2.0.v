"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProcessingIndicatorProps } from "../types";

export function ProcessingIndicator({
  isProcessing,
  processingState,
  className,
}: ProcessingIndicatorProps) {
  if (!isProcessing) return null;

  return (
    <Card className={cn(
      "border bg-blue-50 dark:bg-blue-950/20",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Processing Audio...
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              AI is analyzing your audio and generating SOAP notes. This may take a few moments.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
