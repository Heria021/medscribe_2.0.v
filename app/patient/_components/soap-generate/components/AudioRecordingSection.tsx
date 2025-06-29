"use client";

import * as React from "react";
import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioRecorder, AudioRecorderRef } from "./AudioRecorder";
import { FileText, Mic, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioRecordingSectionProps } from "../types";
import { ProcessingIndicator } from "./ProcessingIndicator";

export function AudioRecordingSection({
  onAudioReady,
  onAudioRemove,
  onGenerateSOAP,
  audioBlob,
  fileName,
  isProcessing,
  disabled = false,
  className,
}: AudioRecordingSectionProps) {
  const audioRecorderRef = useRef<AudioRecorderRef>(null);

  const handleRemoveAudio = () => {
    audioRecorderRef.current?.removeAudio();
    onAudioRemove();
  };

  return (
    <Card className={cn("border w-full flex flex-col h-full", className)}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
          Audio Recording
        </CardTitle>
        <CardDescription className="text-sm">
          Record your voice or upload an audio file to generate structured SOAP notes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Audio Recorder */}
        <div className="flex-1">
          <AudioRecorder
            ref={audioRecorderRef}
            onAudioReady={onAudioReady}
            onAudioRemove={onAudioRemove}
            disabled={disabled || isProcessing}
            maxDuration={600} // 10 minutes
          />
        </div>

        {/* Action Buttons */}
        {audioBlob && !isProcessing && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button
              onClick={handleRemoveAudio}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 py-3"
            >
              Cancel
            </Button>
            <Button 
              onClick={onGenerateSOAP} 
              size="lg" 
              className="w-full sm:w-auto px-8 py-3"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Generate SOAP Notes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <ProcessingIndicator 
            isProcessing={isProcessing}
            processingState={{
              isProcessing,
              progress: 0,
              stage: 'uploading',
              message: 'Processing audio...'
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
