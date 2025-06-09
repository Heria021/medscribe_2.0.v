"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SOAPSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function SOAPSearchBar({
  searchTerm,
  onSearchChange,
  filteredCount,
  totalCount,
}: SOAPSearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search SOAP notes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Badge variant="secondary" className="text-xs">
        {filteredCount}/{totalCount}
      </Badge>
    </div>
  );
}
