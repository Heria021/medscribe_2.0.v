import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Calendar, User, Brain, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SharedSOAPNote } from "@/convex/sharedSoapNotes";

interface PatientSOAPListProps {
  patientId: string;
  sharedSoapNotes?: SharedSOAPNote[];
  isLoading?: boolean;
  selectedSOAPNoteId?: string | null;
  onSelectSOAP?: (soapNoteId: string | null) => void;
  onViewSOAP?: (soapNoteId: string) => void;
  className?: string;
}

/**
 * PatientSOAPList Component
 * 
 * Displays SOAP notes shared by the patient to the doctor
 * Used in the treatment form layout
 */
export const PatientSOAPList = React.memo<PatientSOAPListProps>(({
  patientId,
  sharedSoapNotes = [],
  isLoading = false,
  selectedSOAPNoteId,
  onSelectSOAP,
  onViewSOAP,
  className,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col bg-background border-border", className)}>
        <CardHeader className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-3">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-border rounded-lg bg-background">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-32 flex-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col bg-background border-border", className)}>
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
          <div className="relative px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold text-foreground">
                Patient SOAP Notes
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Shared clinical records
              </p>
            </div>
            <Badge variant="secondary" className="text-xs h-6 px-2">
              {sharedSoapNotes.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-3">
            {sharedSoapNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-sm mb-1 text-foreground">
                  No SOAP Notes
                </h4>
                <p className="text-xs text-muted-foreground">
                  Patient hasn't shared any clinical records yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedSoapNotes.map((note) => {
                  const isSelected = selectedSOAPNoteId === note.soapNote._id;
                  return (
                    <div
                      key={note._id}
                      className={cn(
                        "p-3 border rounded-lg transition-colors cursor-pointer group",
                        isSelected
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-border bg-background hover:bg-muted/30"
                      )}
                      onClick={() => onSelectSOAP?.(isSelected ? null : note.soapNote._id)}
                    >
                    <div className="space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {note.soapNote.data?.chiefComplaint || 
                             note.soapNote.data?.primaryDiagnosis || 
                             "Clinical Note"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <Badge variant="default" className="text-xs h-4 px-1">
                              Selected
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewSOAP?.(note.soapNote._id);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {note.soapNote.subjective?.substring(0, 80)}
                        {(note.soapNote.subjective?.length || 0) > 80 ? '...' : ''}
                      </p>

                      {/* Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {note.soapNote.data?.hasEnhancedData && (
                          <Badge variant="outline" className="text-xs h-4 px-1">
                            <Brain className="h-2 w-2 mr-1" />
                            AI
                          </Badge>
                        )}
                        {note.soapNote.data?.safetyStatus !== undefined && (
                          <Badge 
                            variant={note.soapNote.data.safetyStatus ? "default" : "outline"}
                            className={cn(
                              "text-xs h-4 px-1",
                              !note.soapNote.data.safetyStatus && "border-destructive/50 text-destructive bg-destructive/10"
                            )}
                          >
                            <Shield className="h-2 w-2 mr-1" />
                            {note.soapNote.data.safetyStatus ? 'Safe' : 'Alert'}
                          </Badge>
                        )}
                        {note.shareType === "referral_share" && (
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            Referral
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

PatientSOAPList.displayName = "PatientSOAPList";
