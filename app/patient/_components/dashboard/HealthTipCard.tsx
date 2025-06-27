"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HealthTipCardProps {
  title: string;
  subtitle: string;
  tip: string;
  icon: React.ReactNode;
  gradient: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
  };
  className?: string;
}

export function HealthTipCard({
  title,
  subtitle,
  tip,
  icon,
  gradient,
  className,
}: HealthTipCardProps) {
  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            gradient.iconBg
          )}>
            {icon}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-sm",
              gradient.textColor
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-xs",
              gradient.textColor
            )}>
              {subtitle}
            </p>
          </div>
        </div>
        <p className={cn(
          "text-xs",
          gradient.textColor
        )}>
          {tip}
        </p>
      </CardContent>
    </Card>
  );
}
