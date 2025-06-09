"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

interface SOAPEmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

export function SOAPEmptyState({ searchTerm, onClearSearch }: SOAPEmptyStateProps) {
  return (
    <Card className="backdrop-blur-md bg-background/60 border-border/50 rounded-xl w-full h-full flex flex-col">
      <CardContent className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md">
          <div className="p-6 bg-muted/20 rounded-2xl">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-foreground">No SOAP Notes Found</h3>
            <p className="text-muted-foreground leading-relaxed">
              {searchTerm
                ? "No notes match your search criteria. Try adjusting your search terms or clear the search to see all notes."
                : "You haven't generated any SOAP notes yet. Start by recording your first clinical note to build your medical documentation history."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {searchTerm && (
              <Button variant="outline" onClick={onClearSearch} className="hover:bg-accent transition-colors">
                Clear Search
              </Button>
            )}
            <Link href="/patient/soap/generate">
              <Button className="bg-primary hover:bg-primary/90 transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                {searchTerm ? "Generate New SOAP Note" : "Generate Your First SOAP Note"}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
