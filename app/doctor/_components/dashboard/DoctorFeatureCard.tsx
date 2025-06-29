"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DoctorGradient } from "./index";

export interface DoctorFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: DoctorGradient;
  size?: "default" | "compact";
  actions?: {
    primary?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    };
    secondary?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    };
  };
  className?: string;
  children?: React.ReactNode;
}

export function DoctorFeatureCard({
  title,
  description,
  icon,
  badge,
  gradient,
  size = "default",
  actions,
  className,
  children,
}: DoctorFeatureCardProps) {
  const isCompact = size === "compact";

  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      "hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <CardContent className={cn(
        isCompact ? "p-4" : "p-6",
        "h-full flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              isCompact ? "w-8 h-8" : "w-10 h-10",
              "rounded-lg flex items-center justify-center",
              gradient.iconBg
            )}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                isCompact ? "text-sm" : "text-base",
                "font-semibold",
                gradient.textColor
              )}>
                {title}
              </h3>
              {badge && (
                <Badge className={cn(
                  "text-xs mt-1",
                  gradient.badgeColor || "bg-white/20 text-current"
                )}>
                  {badge}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={cn(
          isCompact ? "text-xs" : "text-sm",
          "mb-4 flex-1",
          gradient.textColor,
          "opacity-90"
        )}>
          {description}
        </p>

        {/* Custom Content */}
        {children && (
          <div className="mb-4">
            {children}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className={cn(
            "flex gap-2 mt-auto",
            isCompact ? "flex-col" : "flex-col sm:flex-row"
          )}>
            {actions.secondary && (
              <Link href={actions.secondary.href} className="flex-1">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full",
                    `border-${gradient.border.replace('border-', '')} ${gradient.textColor}`,
                    `hover:bg-${gradient.from.split(' ')[1]?.replace('from-', '') || 'gray'}/50`,
                    actions.secondary.disabled && "opacity-50 cursor-not-allowed"
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
                    `hover:${gradient.iconBg.replace('bg-', 'bg-').replace('500', '700')}`,
                    actions.primary.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  size={isCompact ? "sm" : "default"}
                  disabled={actions.primary.disabled}
                >
                  {actions.primary.icon}
                  {actions.primary.label}
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
