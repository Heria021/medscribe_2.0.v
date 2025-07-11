import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Stethoscope, Download } from "lucide-react";
import type { SharedSOAPNoteCardProps } from "../types";

/**
 * SharedSOAPNoteCard Component
 * 
 * Displays an individual shared SOAP note with patient info, preview, and actions
 * Optimized for performance with React.memo
 */
export const SharedSOAPNoteCard = React.memo<SharedSOAPNoteCardProps>(({
  note,
  onViewSOAP,
  onTakeAction,
  onDownloadNote,
  formatDate,
}) => {
  return (
    <div className="p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar & Status */}
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {note.patient?.firstName[0]}{note.patient?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          {!note.isRead && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">
                {note.patient?.firstName} {note.patient?.lastName}
              </h4>
              <Badge
                variant={note.shareType === "direct_share" ? "default" : "secondary"}
                className="text-xs h-5"
              >
                {note.shareType === "direct_share" ? "Direct" : "Referral"}
              </Badge>
              {note.soapNote?.qualityScore && (
                <Badge variant="outline" className="text-xs h-5 border-green-200 text-green-700">
                  {note.soapNote.qualityScore}%
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>MRN: <span className="font-medium">{note.patient?.mrn || 'N/A'}</span></span>
            <span>Gender: <span className="font-medium capitalize">{note.patient?.gender}</span></span>
            <span>DOB: <span className="font-medium">{note.patient?.dateOfBirth}</span></span>
          </div>

          {/* Message */}
          {note.message && (
            <div className="bg-blue-50/80 border-l-3 border-blue-400 pl-2 py-1">
              <p className="text-xs text-blue-800 italic">"{note.message}"</p>
            </div>
          )}

          {/* SOAP Preview */}
          <div className="bg-muted/50 rounded p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-blue-700">Subjective:</span>
                <p className="text-muted-foreground mt-0.5 leading-tight">
                  {note.soapNote?.subjective.substring(0, 80)}...
                </p>
              </div>
              {note.soapNote?.assessment && (
                <div>
                  <span className="font-medium text-green-700">Assessment:</span>
                  <p className="text-muted-foreground mt-0.5 leading-tight">
                    {note.soapNote.assessment.substring(0, 80)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onViewSOAP(note._id, note.soapNote!._id)}
                className="h-7 px-3 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTakeAction(note)}
                className="h-7 px-3 text-xs"
              >
                <Stethoscope className="h-3 w-3 mr-1" />
                Take Action
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadNote(note)}
              className="h-7 px-2 text-xs"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

SharedSOAPNoteCard.displayName = "SharedSOAPNoteCard";
