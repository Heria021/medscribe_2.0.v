"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Upload, 
  Trash2,
  Download,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, fileName: string) => void;
  onAudioRemove?: () => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds, default 300 (5 minutes)
}

export function AudioRecorder({ 
  onAudioReady, 
  onAudioRemove, 
  disabled = false,
  maxDuration = 300 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Check for microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const fileName = `recording_${Date.now()}.webm`;
        onAudioReady(blob, fileName);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= maxDuration) {
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      onAudioReady(file, file.name);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
    onAudioRemove?.();
  };

  const downloadAudio = () => {
    if (audioBlob && audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <Card className="border-destructive/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive">Microphone Access Required</CardTitle>
          <CardDescription>
            Please allow microphone access to record audio, or upload an existing audio file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              <Mic className="h-4 w-4 mr-2" />
              Grant Microphone Access
            </Button>
            <div className="text-center text-sm text-muted-foreground">or</div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Audio File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <CardContent className="space-y-4 w-full p-0">
        {/* Recording Controls */}
        {!audioBlob && (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {!isRecording ? (
                <div className="text-center space-y-4">
                  <Button
                    onClick={startRecording}
                    disabled={disabled}
                    size="lg"
                    className="flex items-center gap-2 px-8 py-3"
                  >
                    <Mic className="h-5 w-5" />
                    Start Recording
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Click to start recording your voice
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  </div>
                  {isPaused && (
                    <p className="text-sm text-orange-600">Recording paused</p>
                  )}
                </div>
              )}
            </div>

            {isRecording && (
              <Card className="border bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">Recording</span>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {formatTime(recordingTime)} / {formatTime(maxDuration)}
                      </Badge>
                    </div>
                    <Progress
                      value={(recordingTime / maxDuration) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Audio File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports MP3, WAV, M4A, WebM (max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Audio Playback */}
        {audioBlob && audioUrl && (
          <Card className="border bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={playAudio}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {formatTime(recordingTime)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={downloadAudio}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={removeAudio}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full"
                  controls
                />

                <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                  Audio ready for SOAP note generation
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </div>
  );
}
