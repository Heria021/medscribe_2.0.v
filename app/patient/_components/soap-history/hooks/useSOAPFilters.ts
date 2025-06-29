"use client";

import { useState, useMemo, useCallback } from "react";
import { SOAPNote, SearchFilters, UseSOAPFiltersReturn } from "../types";

/**
 * Custom hook for managing SOAP notes filtering and sorting
 * Provides advanced filtering capabilities with memoized results
 */
export function useSOAPFilters(
  notes: SOAPNote[] = []
): UseSOAPFiltersReturn {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  // Update a specific filter
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.dateRange ||
      filters.qualityRange ||
      filters.sharedOnly
    );
  }, [filters]);

  // Apply filters and sorting
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      result = result.filter(note => {
        const searchableContent = [
          note.subjective,
          note.objective,
          note.assessment,
          note.plan,
          ...(note.recommendations || [])
        ].join(' ').toLowerCase();
        
        return searchableContent.includes(searchTerm);
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      result = result.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= from && noteDate <= to;
      });
    }

    // Apply quality range filter
    if (filters.qualityRange) {
      const { min, max } = filters.qualityRange;
      result = result.filter(note => {
        const quality = note.qualityScore || 0;
        return quality >= min && quality <= max;
      });
    }

    // Apply shared only filter
    if (filters.sharedOnly) {
      // This would need to be implemented with shared notes data
      // For now, we'll skip this filter
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case "date":
          comparison = a.createdAt - b.createdAt;
          break;
        case "quality":
          comparison = (a.qualityScore || 0) - (b.qualityScore || 0);
          break;
        case "shared":
          // This would need shared notes data
          comparison = 0;
          break;
        case "alphabetical":
          comparison = a.subjective.localeCompare(b.subjective);
          break;
        default:
          comparison = a.createdAt - b.createdAt;
      }
      
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [notes, filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    filteredNotes,
    hasActiveFilters,
  };
}
