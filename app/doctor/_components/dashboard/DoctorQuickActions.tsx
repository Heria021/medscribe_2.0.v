"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DoctorGradient, DoctorQuickAction } from "./index";

export interface DoctorQuickActionsProps {
  title: string;
  description?: string;
  actions: DoctorQuickAction[];
  gradient: DoctorGradient;
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "compact";
  className?: string;
}

export function DoctorQuickActions({
  title,
  description,
  actions,
  gradient,
  columns = 2,
  variant = "default",
  className,
}: DoctorQuickActionsProps) {
  const isCompact = variant === "compact";

  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      "flex-shrink-0",
      className
    )}>
      <CardHeader className={cn(
        isCompact ? "pb-2" : "pb-3",
        "flex-shrink-0"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            gradient.iconBg
          )}>
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <CardTitle className={cn(
              "text-sm font-semibold",
              gradient.textColor
            )}>
              {title}
            </CardTitle>
            {description && (
              <p className={cn(
                "text-xs opacity-75",
                gradient.textColor
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        isCompact ? "p-3 pt-0" : "p-4 pt-0"
      )}>
        <div className={cn(
          "grid gap-2",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}>
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={cn(
                action.disabled && "pointer-events-none opacity-50"
              )}
            >
              <div className={cn(
                "p-3 rounded-lg transition-colors cursor-pointer",
                gradient.itemBg || "bg-white/10 hover:bg-white/20",
                gradient.itemBorder && `border ${gradient.itemBorder}`,
                "group"
              )}>
                <div className={cn(
                  "flex items-center gap-2 mb-2",
                  isCompact && "mb-1"
                )}>
                  <div className={cn(
                    "flex-shrink-0",
                    gradient.textColor
                  )}>
                    {action.icon}
                  </div>
                </div>
                <div>
                  <h4 className={cn(
                    "font-medium text-xs mb-1",
                    gradient.textColor
                  )}>
                    {action.title}
                  </h4>
                  <p className={cn(
                    "text-xs opacity-75",
                    gradient.textColor
                  )}>
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
