"use client";

import { useState, useCallback } from "react";
import { UseAudioRecordingReturn } from "../types";

export function useAudioRecording(): UseAudioRecordingReturn {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const handleAudioReady = useCallback((blob: Blob, name: string) => {
    setAudioBlob(blob);
    setFileName(name);
    setIsRecording(false);
  }, []);

  const handleAudioRemove = useCallback(() => {
    setAudioBlob(null);
    setFileName("");
    setDuration(0);
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setDuration(0);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setFileName("");
    setIsRecording(false);
    setDuration(0);
  }, []);

  return {
    audioBlob,
    fileName,
    isRecording,
    duration,
    handleAudioReady,
    handleAudioRemove,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
