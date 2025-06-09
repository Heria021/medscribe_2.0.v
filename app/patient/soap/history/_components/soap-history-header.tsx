"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

interface SOAPHistoryHeaderProps {
  patientProfile?: {
    firstName: string;
    lastName: string;
  } | null;
}

export function SOAPHistoryHeader({ patientProfile }: SOAPHistoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          SOAP Notes History
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage your generated clinical documentation
        </p>
      </div>
      <div className="flex items-center gap-3">
        {patientProfile && (
          <Badge variant="outline" className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Patient: {patientProfile.firstName} {patientProfile.lastName}
          </Badge>
        )}
        <Link href="/patient/soap/generate">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate New SOAP
          </Button>
        </Link>
      </div>
    </div>
  );
}
