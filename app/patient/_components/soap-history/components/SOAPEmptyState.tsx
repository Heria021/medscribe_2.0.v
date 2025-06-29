"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { SOAPEmptyStateProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Generic and configurable SOAP Empty State component
 * Reusable for different empty state scenarios
 */
export const SOAPEmptyState = React.memo<SOAPEmptyStateProps>(({
  searchTerm,
  onClearSearch,
  onCreateNew,
  title,
  description,
  actionLabel,
  showCreateAction = true,
  className,
}) => {
  // Dynamic content based on context
  const isSearchEmpty = !!searchTerm;
  
  const defaultTitle = isSearchEmpty 
    ? "No matching SOAP notes found"
    : "No SOAP notes yet";
    
  const defaultDescription = isSearchEmpty
    ? `No SOAP notes match your search for "${searchTerm}". Try adjusting your search terms or clear the search to see all notes.`
    : "You haven't generated any SOAP notes yet. Start by recording your first clinical note to build your medical documentation history.";
    
  const defaultActionLabel = isSearchEmpty
    ? "Generate New SOAP Note"
    : "Generate Your First SOAP Note";

  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;
  const displayActionLabel = actionLabel || defaultActionLabel;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
          {isSearchEmpty ? (
            <Search className="h-8 w-8 text-muted-foreground" />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {displayDescription}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Clear Search Button (only for search empty state) */}
          {isSearchEmpty && onClearSearch && (
            <Button 
              variant="outline" 
              onClick={onClearSearch} 
              className="hover:bg-accent transition-colors"
            >
              Clear Search
            </Button>
          )}
          
          {/* Create New Action */}
          {showCreateAction && (
            <>
              {onCreateNew ? (
                <Button 
                  onClick={onCreateNew}
                  className="bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {displayActionLabel}
                </Button>
              ) : (
                <Link href="/patient/soap/generate">
                  <Button className="bg-primary hover:bg-primary/90 transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    {displayActionLabel}
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SOAPEmptyState.displayName = "SOAPEmptyState";
