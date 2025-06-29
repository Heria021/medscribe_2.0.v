"use client";

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SOAPNote, UseSOAPSearchReturn } from "../types";

/**
 * Custom hook for SOAP notes search functionality with debouncing
 * Optimized for performance with proper memoization
 */
export function useSOAPSearch(
  notes: SOAPNote[] = [],
  debounceMs: number = 300
): UseSOAPSearchReturn {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Memoized search function for better performance
  const searchNotes = useCallback((notes: SOAPNote[], term: string): SOAPNote[] => {
    if (!term.trim()) return notes;
    
    const searchTermLower = term.toLowerCase().trim();
    
    return notes.filter(note => {
      // Search across all SOAP sections
      const searchableContent = [
        note.subjective,
        note.objective,
        note.assessment,
        note.plan,
        ...(note.recommendations || [])
      ].join(' ').toLowerCase();
      
      // Support multiple search terms (AND logic)
      const searchTerms = searchTermLower.split(' ').filter(t => t.length > 0);
      
      return searchTerms.every(term => 
        searchableContent.includes(term)
      );
    });
  }, []);

  // Memoized filtered notes
  const filteredNotes = useMemo(() => 
    searchNotes(notes, debouncedSearchTerm),
    [notes, debouncedSearchTerm, searchNotes]
  );

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Search count for display
  const searchCount = filteredNotes.length;

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    filteredNotes,
    searchCount,
  };
}
