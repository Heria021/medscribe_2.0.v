"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  CalendarDays,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentStatsProps } from "../types";

/**
 * Appointment statistics component
 * 
 * Features:
 * - Displays comprehensive appointment metrics
 * - Loading state support
 * - Responsive grid layout
 * - Visual indicators and icons
 * - Performance optimized with React.memo
 * 
 * @param props - AppointmentStatsProps
 * @returns JSX.Element
 */
export const AppointmentStats = React.memo<AppointmentStatsProps>(({
  stats,
  isLoading = false,
  className,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Statistics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Stat items configuration
  const statItems = React.useMemo(() => [
    {
      label: "Total Appointments",
      value: stats.total,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Upcoming",
      value: stats.upcoming,
      icon: <Clock className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: <XCircle className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ], [stats]);

  const additionalStats = React.useMemo(() => [
    {
      label: "This Month",
      value: stats.thisMonth,
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Next Week",
      value: stats.nextWeek,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ], [stats]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Appointment Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center p-4 rounded-lg border"
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                item.bgColor
              )}>
                <div className={item.color}>
                  {item.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-center">
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Statistics */}
        <div className="flex flex-wrap gap-4 justify-center">
          {additionalStats.map((item) => (
            <Badge
              key={item.label}
              variant="outline"
              className="flex items-center gap-2 px-3 py-2"
            >
              {item.icon}
              <span className="font-medium">{item.value}</span>
              <span className="text-muted-foreground">{item.label}</span>
            </Badge>
          ))}
        </div>

        {/* Completion Rate Visual */}
        {stats.completionRate > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AppointmentStats.displayName = "AppointmentStats";

/**
 * Compact appointment stats for smaller spaces
 */
export const CompactAppointmentStats = React.memo<AppointmentStatsProps>(({
  stats,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn("flex gap-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 space-y-1">
            <div className="h-3 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4", className)}>
      <div className="flex-1 text-center">
        <div className="text-lg font-bold text-blue-600">{stats.upcoming}</div>
        <div className="text-xs text-muted-foreground">Upcoming</div>
      </div>
      <div className="flex-1 text-center">
        <div className="text-lg font-bold text-green-600">{stats.completed}</div>
        <div className="text-xs text-muted-foreground">Completed</div>
      </div>
      <div className="flex-1 text-center">
        <div className="text-lg font-bold text-orange-600">{stats.thisMonth}</div>
        <div className="text-xs text-muted-foreground">This Month</div>
      </div>
    </div>
  );
});

CompactAppointmentStats.displayName = "CompactAppointmentStats";
