"use client";

import { FileText, Star, Share, Calendar } from "lucide-react";

interface SOAPStatsOverviewProps {
  totalNotes: number;
  avgQuality: number;
  sharedCount: number;
  recentNotes: number;
}

export function SOAPStatsOverview({
  totalNotes,
  avgQuality,
  sharedCount,
  recentNotes,
}: SOAPStatsOverviewProps) {
  const stats = [
    {
      label: "Total",
      value: totalNotes,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Quality",
      value: `${avgQuality}%`,
      icon: Star,
      color: "emerald",
    },
    {
      label: "Shared",
      value: sharedCount,
      icon: Share,
      color: "violet",
    },
    {
      label: "Recent",
      value: recentNotes,
      icon: Calendar,
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-500/15 group-hover:bg-blue-500/20 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-500/15 group-hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      violet: "bg-violet-500/15 group-hover:bg-violet-500/20 text-violet-600 dark:text-violet-400",
      orange: "bg-orange-500/15 group-hover:bg-orange-500/20 text-orange-600 dark:text-orange-400",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="backdrop-blur-md bg-background/50 border border-border/40 rounded-lg p-4 hover:bg-background/70 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${getColorClasses(stat.color)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
