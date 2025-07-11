import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { SharedSOAPNoteCard } from "./SharedSOAPNoteCard";
import { cn } from "@/lib/utils";
import type { SharedSOAPNotesListProps } from "../types";

/**
 * SharedSOAPNotesList Component
 * 
 * Displays a list of shared SOAP notes with empty states and filtering support
 * Handles both loading and empty states appropriately
 */
export const SharedSOAPNotesList = React.memo<SharedSOAPNotesListProps>(({
  notes,
  isLoading,
  onViewSOAP,
  onTakeAction,
  onDownloadNote,
  formatDate,
  onClearFilters,
  className = "",
}) => {
  // Determine if we should show "no notes" vs "no filtered results"
  const hasAnyNotes = notes && notes.length > 0;

  return (
    <div className={cn("flex-1 min-h-0", className)}>
      <Card className="h-full flex flex-col">
        <CardHeader className="py-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Shared Notes</CardTitle>
            <Badge variant="outline" className="text-xs">
              {notes.length} notes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full">
            {notes.length === 0 ? (
              <EmptyState hasAnyNotes={hasAnyNotes} onClearFilters={onClearFilters} />
            ) : (
              <div className="divide-y">
                {notes.map((note) => (
                  <SharedSOAPNoteCard
                    key={note._id}
                    note={note}
                    onViewSOAP={onViewSOAP}
                    onTakeAction={onTakeAction}
                    onDownloadNote={onDownloadNote}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

/**
 * EmptyState Component
 *
 * Shows appropriate empty state message based on whether there are any notes at all
 */
const EmptyState = React.memo<{ hasAnyNotes: boolean; onClearFilters?: () => void }>(({ hasAnyNotes, onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center mb-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      {hasAnyNotes ? (
        <>
          <h3 className="font-medium mb-1">No notes match your filters</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Try adjusting your search terms or filters to see more results.
          </p>
          {onClearFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="mt-3"
            >
              Clear All Filters
            </Button>
          )}
        </>
      ) : (
        <>
          <h3 className="font-medium mb-1">No shared notes yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Shared SOAP notes will appear here when patients share them with you.
            Patients can share notes directly or through referrals.
          </p>
        </>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";
SharedSOAPNotesList.displayName = "SharedSOAPNotesList";
