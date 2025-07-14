import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * SharedSOAPSkeleton Component
 * 
 * Provides loading skeleton for the shared SOAP notes page
 * Matches the layout structure of the actual content
 */
export const SharedSOAPSkeleton = React.memo(() => {
  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Modern Header Skeleton */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </Card>

      {/* Notes List Skeleton */}
      <div className="flex-1 min-h-0">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar Skeleton */}
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

                  {/* Content Skeleton */}
                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>

                    {/* SOAP Preview */}
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                      <Skeleton className="h-8 w-10" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});

SharedSOAPSkeleton.displayName = "SharedSOAPSkeleton";
