import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SharedSOAPFiltersProps } from "../types";

/**
 * SharedSOAPFilters Component
 * 
 * Provides comprehensive filtering interface for shared SOAP notes
 * Includes search, read status, share type, and date range filters
 */
export const SharedSOAPFilters = React.memo<SharedSOAPFiltersProps>(({
  filters,
  onSearchChange,
  onUnreadToggle,
  onShareTypeChange,
  onDateRangeChange,
  onClearFilters,
  className = "",
}) => {
  return (
    <div className={cn("flex-shrink-0 flex flex-col sm:flex-row gap-4", className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, MRN, or content..."
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex gap-3">
        {/* Unread Filter Toggle */}
        <Button
          variant={filters.filterUnread ? "default" : "outline"}
          onClick={() => onUnreadToggle(!filters.filterUnread)}
          size="sm"
        >
          <Mail className="h-4 w-4 mr-1" />
          {filters.filterUnread ? "All" : "Unread"}
        </Button>

        {/* Share Type Filter */}
        <Select value={filters.filterShareType} onValueChange={onShareTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="direct_share">Direct</SelectItem>
            <SelectItem value="referral_share">Referral</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={filters.filterDateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

SharedSOAPFilters.displayName = "SharedSOAPFilters";
