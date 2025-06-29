"use client";

import { useMemo, useCallback, useState } from "react";
import { SOAPNote, SharedSOAPNote, SOAPStats, UseSOAPStatsReturn } from "../types";

/**
 * Custom hook for calculating and managing SOAP notes statistics
 * Optimized with memoization for expensive calculations
 */
export function useSOAPStats(
  notes: SOAPNote[] = [],
  sharedNotes: SharedSOAPNote[] = []
): UseSOAPStatsReturn {
  // Memoized stats calculation - simplified without error state to prevent re-renders
  const stats = useMemo((): SOAPStats => {
    const totalNotes = notes.length;
    const sharedCount = sharedNotes.length;

    // Calculate average quality score
    const notesWithQuality = notes.filter(note =>
      note.qualityScore !== undefined && note.qualityScore !== null
    );

    const avgQuality = notesWithQuality.length > 0
      ? Math.round(
          notesWithQuality.reduce((acc, note) => acc + (note.qualityScore || 0), 0) /
          notesWithQuality.length
        )
      : 0;

    // Calculate recent notes (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentNotes = notes.filter(note => note.createdAt > sevenDaysAgo).length;

    return {
      totalNotes,
      sharedCount,
      avgQuality,
      recentNotes,
    };
  }, [notes, sharedNotes]);

  // Refresh stats function (placeholder)
  const refreshStats = useCallback(() => {
    // Stats will be recalculated automatically due to memoization
  }, []);

  const loading = false; // Since we're calculating from existing data
  const error = null; // Simplified - no error state to prevent re-renders

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}

/**
 * Utility function to get quality level from score
 */
export function getQualityLevel(score?: number): "excellent" | "good" | "fair" | "poor" {
  if (!score) return "poor";
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

/**
 * Utility function to get quality color classes
 */
export function getQualityColor(score?: number): string {
  const level = getQualityLevel(score);
  
  const colorMap = {
    excellent: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
    good: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
    fair: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
    poor: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
  };
  
  return colorMap[level];
}
