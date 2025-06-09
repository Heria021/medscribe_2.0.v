"use client";

import { SOAPNoteCard } from "./soap-note-card";
import { createTimelineFromSharedNotes } from "@/components/ui/timeline";

interface SOAPNotesGridProps {
  notes: any[];
  sharedNotesMap: Map<string, any[]>;
  referrals: any[];
  onDownload: (note: any) => void;
  onShare: (noteId: string) => void;
  formatDate: (timestamp: number) => string;
  getQualityColor: (score?: number) => string;
}

export function SOAPNotesGrid({
  notes,
  sharedNotesMap,
  referrals,
  onDownload,
  onShare,
  formatDate,
  getQualityColor,
}: SOAPNotesGridProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {notes.map((note) => {
            const noteSharedWith = sharedNotesMap.get(note._id) || [];
            const timelineItems = createTimelineFromSharedNotes(noteSharedWith, referrals || [], note._id);

            return (
              <SOAPNoteCard
                key={note._id}
                note={note}
                sharedWith={noteSharedWith}
                timelineItems={timelineItems}
                onDownload={onDownload}
                onShare={onShare}
                formatDate={formatDate}
                getQualityColor={getQualityColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
