"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Calendar, Phone, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorGradient, PatientRelationship } from "./index";

export interface PatientListCardProps {
  title: string;
  description?: string;
  patients: PatientRelationship[];
  gradient: DoctorGradient;
  maxItems?: number;
  viewAllHref?: string;
  emptyState?: {
    icon: React.ReactNode;
    message: string;
    actionLabel: string;
    actionHref: string;
  };
  className?: string;
}

export function PatientListCard({
  title,
  description,
  patients,
  gradient,
  maxItems = 4,
  viewAllHref = "/doctor/patients",
  emptyState,
  className,
}: PatientListCardProps) {
  const router = useRouter();

  // Helper function to calculate age
  const calculateAge = (dateOfBirth: string) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const displayedPatients = patients.slice(0, maxItems);
  const hasPatients = patients && patients.length > 0;

  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      "flex flex-col min-h-0",
      className
    )}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              gradient.iconBg
            )}>
              <Users className="h-4 w-4 text-white" />
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
          <Link href={viewAllHref}>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-6 px-2 text-xs bg-white/10 border-white/20 hover:bg-white/20",
                gradient.textColor
              )}
            >
              <Users className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          {!hasPatients ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                gradient.itemBg || "bg-white/10"
              )}>
                {emptyState?.icon || <Users className="h-6 w-6" />}
              </div>
              <h3 className={cn(
                "font-medium text-sm mb-1",
                gradient.textColor
              )}>
                {emptyState?.message || "No Patients Yet"}
              </h3>
              <p className={cn(
                "text-xs mb-3 max-w-[180px] opacity-75",
                gradient.textColor
              )}>
                Patients will appear here once assigned to you
              </p>
              <Link href={emptyState?.actionHref || viewAllHref}>
                <Button 
                  size="sm" 
                  className="h-7 px-3 text-xs bg-white/90 hover:bg-white text-gray-900"
                >
                  {emptyState?.actionLabel || "View Patients"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {displayedPatients.map((relationship) => {
                const patient = relationship.patient;
                const age = calculateAge(patient.dateOfBirth);

                return (
                  <div
                    key={relationship._id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      gradient.itemBg || "hover:bg-white/10",
                      gradient.itemBorder && `border ${gradient.itemBorder}`
                    )}
                    onClick={() => router.push(`/doctor/patients/${patient._id}`)}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs font-medium bg-white/20 text-current">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium text-sm truncate",
                        gradient.textColor
                      )}>
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className={cn(
                        "flex items-center gap-3 text-xs opacity-75",
                        gradient.textColor
                      )}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {age}y
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="h-3 w-3" />
                          {patient.primaryPhone}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 w-6 p-0 flex-shrink-0 hover:bg-white/20",
                        gradient.textColor
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/doctor/patients/${patient._id}`);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
