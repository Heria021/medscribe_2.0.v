"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard } from "@/components/ui/action-card";
import { Calendar, Video, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickActionsGridProps } from "../types";

/**
 * Quick actions grid component for appointment-related actions
 * 
 * Features:
 * - Reusable grid of action cards
 * - Configurable variants (default, compact)
 * - Responsive design
 * - Consistent styling with existing ActionCard component
 * - Performance optimized with React.memo
 * 
 * @param props - QuickActionsGridProps
 * @returns JSX.Element
 */
export const QuickActionsGrid = React.memo<QuickActionsGridProps>(({
  className,
  variant = "default",
}) => {
  // Action configuration
  const actions = React.useMemo(() => [
    {
      title: "Book",
      description: "New appointment",
      icon: <Calendar className="h-5 w-5" />,
      href: "/patient/appointments/book",
    },
    {
      title: "Virtual",
      description: "Online consultation",
      icon: <Video className="h-5 w-5" />,
      href: "/patient/appointments/virtual",
    },
    {
      title: "Emergency",
      description: "Immediate help",
      icon: <AlertCircle className="h-5 w-5" />,
      href: "/patient/emergency",
    },
  ], []);

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className={cn("flex-shrink-0", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-3 gap-1">
            {actions.map((action) => (
              <ActionCard
                key={action.title}
                title={action.title}
                description={action.description}
                icon={action.icon}
                href={action.href}
                className="border-0 shadow-none p-2 text-xs"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map((action) => (
            <ActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              className="h-full"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

QuickActionsGrid.displayName = "QuickActionsGrid";

/**
 * Extended quick actions grid with additional actions
 */
interface ExtendedQuickActionsGridProps extends QuickActionsGridProps {
  showExtended?: boolean;
}

export const ExtendedQuickActionsGrid = React.memo<ExtendedQuickActionsGridProps>(({
  className,
  variant = "default",
  showExtended = false,
}) => {
  // Extended action configuration
  const extendedActions = React.useMemo(() => [
    {
      title: "Book",
      description: "New appointment",
      icon: <Calendar className="h-5 w-5" />,
      href: "/patient/appointments/book",
    },
    {
      title: "Virtual",
      description: "Online consultation",
      icon: <Video className="h-5 w-5" />,
      href: "/patient/appointments/virtual",
    },
    {
      title: "Emergency",
      description: "Immediate help",
      icon: <AlertCircle className="h-5 w-5" />,
      href: "/patient/emergency",
    },
    ...(showExtended ? [
      {
        title: "History",
        description: "Past appointments",
        icon: <Calendar className="h-5 w-5" />,
        href: "/patient/appointments/history",
      },
      {
        title: "Prescriptions",
        description: "View medications",
        icon: <Calendar className="h-5 w-5" />,
        href: "/patient/prescriptions",
      },
      {
        title: "Records",
        description: "Medical records",
        icon: <Calendar className="h-5 w-5" />,
        href: "/patient/records",
      },
    ] : []),
  ], [showExtended]);

  const gridCols = showExtended ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-1 sm:grid-cols-3";

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {showExtended ? "All Actions" : "Quick Actions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", gridCols)}>
          {extendedActions.map((action) => (
            <ActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              className="h-full"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

ExtendedQuickActionsGrid.displayName = "ExtendedQuickActionsGrid";
