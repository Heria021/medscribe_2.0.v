import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Stethoscope, Download, Clock, User, Calendar } from "lucide-react";
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
    <Card className="hover:shadow-sm transition-all duration-200 border-border/50">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar & Status */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                {note.patient?.firstName[0]}{note.patient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {!note.isRead && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive border border-background rounded-full"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header Row - More Compact */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {note.patient?.firstName} {note.patient?.lastName}
                </h4>
                <Badge
                  variant={note.shareType === "direct_share" ? "default" : "secondary"}
                  className="text-xs h-5 px-1.5"
                >
                  {note.shareType === "direct_share" ? "Direct" : "Referral"}
                </Badge>
                {note.soapNote?.qualityScore && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                    {note.soapNote.qualityScore}%
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>

            {/* Patient Info - Compact */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>MRN: {note.patient?.mrn || 'N/A'}</span>
              <span className="capitalize">{note.patient?.gender}</span>
              <span>{note.patient?.dateOfBirth}</span>
            </div>

            {/* Message - Compact */}
            {note.message && (
              <div className="bg-muted/30 border-l-2 border-primary/50 pl-2 py-1 rounded-r text-xs">
                <p className="text-muted-foreground italic">"{note.message.substring(0, 100)}..."</p>
              </div>
            )}

            {/* SOAP Preview - Compact */}
            <div className="bg-muted/20 rounded p-2 border border-border/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-foreground">S:</span>
                  <span className="text-muted-foreground ml-1">
                    {note.soapNote?.subjective.substring(0, 60)}...
                  </span>
                </div>
                {note.soapNote?.assessment && (
                  <div>
                    <span className="font-medium text-foreground">A:</span>
                    <span className="text-muted-foreground ml-1">
                      {note.soapNote.assessment.substring(0, 60)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => onViewSOAP(note)}
                  className="h-7 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTakeAction(note)}
                  className="h-7 px-2 text-xs"
                >
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Action
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadNote(note)}
                className="h-7 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SharedSOAPNoteCard.displayName = "SharedSOAPNoteCard";
