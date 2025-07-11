import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { 
  UseSharedSOAPNotesReturn, 
  SharedSOAPNote, 
  SharedSOAPFilters,
  Doctor 
} from "../types";

/**
 * Custom hook for managing shared SOAP notes data and filtering
 * 
 * Features:
 * - Fetches shared SOAP notes for a doctor
 * - Provides comprehensive filtering functionality
 * - Handles search across multiple fields
 * - Manages filter state
 * - Optimized with proper memoization
 * 
 * @param doctorProfile - The doctor's profile data
 * @returns {UseSharedSOAPNotesReturn} Notes data and filtering utilities
 */
export function useSharedSOAPNotes(
  doctorProfile: Doctor | null | undefined
): UseSharedSOAPNotesReturn {
  // Filter state
  const [filters, setFilters] = useState<SharedSOAPFilters>({
    searchTerm: "",
    filterUnread: false,
    filterShareType: "all",
    filterDateRange: "all",
  });

  // Fetch shared SOAP notes
  const sharedSOAPNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesForDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  // Enhanced filtering logic
  const filteredNotes = useMemo((): SharedSOAPNote[] => {
    if (!sharedSOAPNotes) return [];

    return sharedSOAPNotes.filter(note => {
      // Search filter - comprehensive search across multiple fields
      const matchesSearch = !filters.searchTerm ||
        note.patient?.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.patient?.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.patient?.mrn?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.soapNote?.subjective.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.soapNote?.assessment.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.soapNote?.plan.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Read status filter
      const matchesReadFilter = !filters.filterUnread || !note.isRead;

      // Share type filter
      const matchesShareType = filters.filterShareType === "all" || 
        note.shareType === filters.filterShareType;

      // Date range filter
      const matchesDateRange = (() => {
        if (filters.filterDateRange === "all") return true;
        const now = Date.now();
        const noteDate = note.createdAt;

        switch (filters.filterDateRange) {
          case "today":
            return now - noteDate < 24 * 60 * 60 * 1000;
          case "week":
            return now - noteDate < 7 * 24 * 60 * 60 * 1000;
          case "month":
            return now - noteDate < 30 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesReadFilter && matchesShareType && matchesDateRange;
    });
  }, [sharedSOAPNotes, filters]);

  // Filter update functions
  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setFilterUnread = useCallback((unread: boolean) => {
    setFilters(prev => ({ ...prev, filterUnread: unread }));
  }, []);

  const setFilterShareType = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, filterShareType: type }));
  }, []);

  const setFilterDateRange = useCallback((range: string) => {
    setFilters(prev => ({ ...prev, filterDateRange: range }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      filterUnread: false,
      filterShareType: "all",
      filterDateRange: "all",
    });
  }, []);

  return {
    sharedSOAPNotes,
    filteredNotes,
    isLoading: sharedSOAPNotes === undefined,
    error: null, // Convex queries don't expose errors in the same way
    filters,
    setSearchTerm,
    setFilterUnread,
    setFilterShareType,
    setFilterDateRange,
    clearAllFilters,
  };
}
