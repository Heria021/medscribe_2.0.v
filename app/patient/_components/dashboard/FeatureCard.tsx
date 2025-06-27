"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    badgeColor: string;
  };
  actions: {
    primary?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
    };
    secondary?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    };
  };
  size?: "default" | "compact";
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  badge,
  gradient,
  actions,
  size = "default",
  className,
}: FeatureCardProps) {
  const isCompact = size === "compact";
  
  return (
    <Card className={cn(
      "p-0 h-full",
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      className
    )}>
      <CardContent className={cn(
        isCompact ? "p-4" : "p-6"
      )}>
        <div className={cn(
          isCompact ? "space-y-2" : "space-y-3"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-lg flex items-center justify-center",
              isCompact ? "w-8 h-8" : "w-10 h-10",
              gradient.iconBg
            )}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold",
                isCompact ? "text-sm" : "text-lg",
                gradient.textColor
              )}>
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className={cn(
                  "text-xs",
                  gradient.badgeColor
                )}>
                  {badge}
                </Badge>
              )}
            </div>
          </div>
          
          <p className={cn(
            "text-sm",
            gradient.textColor
          )}>
            {description}
          </p>
          
          <div className={cn(
            "flex gap-2",
            isCompact ? "flex-col" : "flex-col sm:flex-row"
          )}>
            {actions.secondary && (
              <Link href={actions.secondary.href} className="flex-1">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full",
                    `border-${gradient.border.replace('border-', '')} ${gradient.textColor}`,
                    `hover:bg-${gradient.from.split(' ')[1]?.replace('from-', '') || 'gray'}/50`
                  )}
                  disabled={actions.secondary.disabled}
                  size={isCompact ? "sm" : "default"}
                >
                  {actions.secondary.icon}
                  {actions.secondary.label}
                </Button>
              </Link>
            )}
            {actions.primary && (
              <Link href={actions.primary.href} className="flex-1">
                <Button
                  className={cn(
                    "w-full",
                    gradient.iconBg.replace('bg-', 'bg-').replace('500', '600'),
                    `hover:${gradient.iconBg.replace('bg-', 'bg-').replace('500', '700')}`
                  )}
                  size={isCompact ? "sm" : "default"}
                >
                  {actions.primary.icon}
                  {actions.primary.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
