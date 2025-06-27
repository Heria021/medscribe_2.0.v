import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { RelevantDocumentsSectionProps } from "../types";

export const RelevantDocumentsSection: React.FC<RelevantDocumentsSectionProps> = React.memo(({ documents }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  if (!documents || documents.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
      >
        <FileText className="h-3 w-3 mr-1" />
        {documents.length} relevant document{documents.length > 1 ? 's' : ''} found
        {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-background border rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-xs h-4">
                  {doc.event_type.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {doc.content_preview}
              </p>
              <div className="mt-1 text-xs text-muted-foreground">
                Similarity: {(doc.similarity_score * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

RelevantDocumentsSection.displayName = "RelevantDocumentsSection";
