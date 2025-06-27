"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard } from "@/components/ui/action-card";
import { cn } from "@/lib/utils";

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}

export interface QuickActionGridProps {
  title: string;
  actions: QuickAction[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "compact";
  className?: string;
}

export function QuickActionGrid({
  title,
  actions,
  columns = 2,
  variant = "compact",
  className,
}: QuickActionGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <Card className={cn("flex-shrink-0", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4">
        <div className={cn(
          "grid gap-3",
          gridClasses[columns]
        )}>
          {actions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              variant={variant}
              className="border-0 shadow-none"
              disabled={action.disabled}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
