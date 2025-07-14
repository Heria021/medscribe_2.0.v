import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Mail, Filter, X } from "lucide-react";
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
  const hasActiveFilters = filters.filterUnread ||
    filters.filterShareType !== "all" ||
    filters.filterDateRange !== "all" ||
    filters.searchTerm.length > 0;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, MRN, or content..."
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Unread Filter Toggle */}
          <Button
            variant={filters.filterUnread ? "default" : "outline"}
            onClick={() => onUnreadToggle(!filters.filterUnread)}
            size="sm"
            className="h-10"
          >
            <Mail className="h-4 w-4 mr-2" />
            {filters.filterUnread ? "Unread Only" : "All Notes"}
          </Button>

          {/* Share Type Filter */}
          <Select value={filters.filterShareType} onValueChange={onShareTypeChange}>
            <SelectTrigger className="w-36 h-10">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="direct_share">Direct Share</SelectItem>
              <SelectItem value="referral_share">Referral</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={filters.filterDateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-32 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              size="sm"
              className="h-10 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

SharedSOAPFilters.displayName = "SharedSOAPFilters";
