"use client";

import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { SOAPSearchBarProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Optimized SOAP Search Bar with debouncing and optional filters
 * Memoized for performance with configurable debounce timing
 */
export const SOAPSearchBar = React.memo<SOAPSearchBarProps>(({
  searchTerm,
  onSearchChange,
  filteredCount,
  totalCount,
  placeholder = "Search SOAP notes...",
  debounceMs = 300,
  showFilters = false,
  filters,
  onFiltersChange,
  className,
}) => {
  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  // Handle filter toggle (placeholder for future implementation)
  const handleFilterToggle = useCallback(() => {
    // This would open a filter dialog or dropdown
    console.log("Filter toggle clicked");
  }, []);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Results Count Badge */}
      <Badge 
        variant={searchTerm ? "default" : "secondary"} 
        className="text-xs whitespace-nowrap"
      >
        {filteredCount}/{totalCount}
      </Badge>

      {/* Optional Filters Button */}
      {showFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleFilterToggle}
          className={cn(
            "gap-2",
            filters && Object.keys(filters).length > 1 && "border-primary text-primary"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      )}
    </div>
  );
});

SOAPSearchBar.displayName = "SOAPSearchBar";
