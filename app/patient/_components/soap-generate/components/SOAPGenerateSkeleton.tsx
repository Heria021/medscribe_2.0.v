"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SOAPGenerateSkeletonProps } from "../types";

export function SOAPGenerateSkeleton({
  className,
}: SOAPGenerateSkeletonProps) {
  return (
    <div className={cn("h-full flex flex-col space-y-4", className)}>
      {/* Header Skeleton */}
      <div className="flex-shrink-0 space-y-2">
        <Skeleton className="h-6 sm:h-7 w-48 sm:w-64" />
        <Skeleton className="h-4 w-72 sm:w-96" />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4 sm:space-y-6 pb-6">
          {/* Audio Recording Section with Tips Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Audio Recording Skeleton - Takes 2 columns */}
            <div className="lg:col-span-2 flex">
              <Card className="border w-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4 w-full flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="space-y-6">
                      <div className="flex flex-col items-center space-y-4">
                        <Skeleton className="h-10 sm:h-12 w-32 sm:w-40 rounded-lg" />
                        <Skeleton className="h-4 w-40 sm:w-48" />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">or</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-3">
                        <Skeleton className="h-10 sm:h-12 w-32 sm:w-40 rounded-lg" />
                        <Skeleton className="h-3 w-48 sm:w-56" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recording Tips Skeleton - Takes 1 column */}
            <div className="lg:col-span-1 flex">
              <Card className="border w-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4 text-sm h-full flex flex-col justify-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="space-y-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-3 w-full" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="space-y-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-3 w-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it Works Skeleton */}
          <Card className="border w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                <Skeleton className="h-5 w-40 sm:w-48" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-24 mx-auto" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
