"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SOAPGenerateContentProps } from "../types";
import { AudioRecordingSection } from "./AudioRecordingSection";
import { RecordingTipsSection } from "./RecordingTipsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { useSOAPGenerate } from "../hooks";

export function SOAPGenerateContent({
  patientProfile,
  className,
}: SOAPGenerateContentProps) {
  const {
    audioBlob,
    fileName,
    isProcessing,
    processingState,
    handleAudioReady,
    handleAudioRemove,
    handleGenerateSOAP,
  } = useSOAPGenerate(patientProfile);

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Audio Recording Section with Tips - Mobile First Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Audio Recording - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2 order-1">
          <AudioRecordingSection
            onAudioReady={handleAudioReady}
            onAudioRemove={handleAudioRemove}
            onGenerateSOAP={handleGenerateSOAP}
            audioBlob={audioBlob}
            fileName={fileName}
            isProcessing={isProcessing}
          />
        </div>

        {/* Recording Tips - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1 order-2">
          <RecordingTipsSection />
        </div>
      </div>

      {/* How it Works Section */}
      <HowItWorksSection />
    </div>
  );
}
