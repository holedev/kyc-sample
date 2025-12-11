/** biome-ignore-all lint/nursery/noLeakedRender: <TODO> */

"use client";

import { Mic, Play, RotateCcw, Square } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type VoiceRecorderProps = {
  onRecordingComplete?: (audioBlob: Blob) => void;
  label: string;
};

export function VoiceRecorder({ onRecordingComplete, label }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp4" });
        setAudioBlob(audioBlob);
        setHasRecording(true);

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }

        for (const track of stream.getTracks()) {
          track.stop();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const reRecord = () => {
    if (isPlaying) {
      stopPlaying();
    }
    setAudioBlob(null);
    setHasRecording(false);
  };

  return (
    <div className='flex flex-col items-center space-y-2'>
      <div className='flex items-center space-x-2'>
        {hasRecording ? (
          <div className='flex items-center space-x-2'>
            <Button
              className='flex items-center space-x-1'
              onClick={isPlaying ? stopPlaying : playRecording}
              type='button'
              variant='outline'
            >
              {isPlaying ? (
                <>
                  <Square className='h-4 w-4' />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className='h-4 w-4' />
                  <span>Play</span>
                </>
              )}
            </Button>
            <Button className='flex items-center space-x-1' onClick={reRecord} type='button' variant='outline'>
              <RotateCcw className='h-4 w-4' />
              <span>Re-record</span>
            </Button>
          </div>
        ) : (
          <Button
            className='flex items-center space-x-1'
            onClick={isRecording ? stopRecording : startRecording}
            type='button'
            variant={isRecording ? "destructive" : "outline"}
          >
            {isRecording ? (
              <>
                <Square className='h-4 w-4' />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className='h-4 w-4' />
                <span>Record {label}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {isRecording && <div className='animate-pulse text-muted-foreground text-xs'>Recording {label}...</div>}

      {hasRecording && !isRecording && <div className='text-green-600 text-xs'>✓ {label} recorded</div>}
    </div>
  );
}
