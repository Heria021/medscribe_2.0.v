"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorGradient } from "./index";

export interface AIAssistantCardProps {
  title: string;
  description: string;
  badge?: string;
  gradient: DoctorGradient;
  href: string;
  buttonLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AIAssistantCard({
  title,
  description,
  badge = "Smart Chat",
  gradient,
  href,
  buttonLabel = "Chat with Assistant",
  icon = <Brain className="h-4 w-4 text-white" />,
  className,
}: AIAssistantCardProps) {
  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      "flex-shrink-0 hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              gradient.iconBg
            )}>
              {icon}
            </div>
            <div>
              <h3 className={cn(
                "text-sm font-semibold",
                gradient.textColor
              )}>
                {title}
              </h3>
              <Badge className={cn(
                "text-xs",
                gradient.badgeColor || "bg-white/20 text-current"
              )}>
                {badge}
              </Badge>
            </div>
          </div>
          <p className={cn(
            "text-xs opacity-90",
            gradient.textColor
          )}>
            {description}
          </p>
          <Link href={href} className="block">
            <Button 
              size="sm" 
              className="w-full bg-white/90 hover:bg-white text-gray-900 font-medium"
            >
              <Bot className="h-3 w-3 mr-2" />
              {buttonLabel}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
