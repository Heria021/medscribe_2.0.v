"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOAPNotesDisplay } from "@/components/patient/soap-notes-display";
import { ArrowLeft, Star, Calendar } from "lucide-react";

interface SOAPNoteDetailViewProps {
  note: any;
  onBack: () => void;
  formatDate: (timestamp: number) => string;
  getQualityColor: (score?: number) => string;
}

export function SOAPNoteDetailView({
  note,
  onBack,
  formatDate,
  getQualityColor,
}: SOAPNoteDetailViewProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`${getQualityColor(note.qualityScore)} flex items-center gap-1.5 px-3 py-1`}
          >
            <Star className="h-3 w-3" />
            Quality: {note.qualityScore}%
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
            <Calendar className="h-3 w-3" />
            {formatDate(note.createdAt)}
          </Badge>
        </div>
      </div>
      
      {/* SOAP Notes Display - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SOAPNotesDisplay soapNote={note} />
      </div>
    </div>
  );
}
