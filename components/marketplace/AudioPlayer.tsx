"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  trackName?: string;
  artistName?: string;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  trackName,
  artistName,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // iTunes previews are 30 seconds
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoaded(true);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Audio playback error:", err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return "0:00";
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-surface-border bg-surface/90 backdrop-blur-md p-4 shadow-xl space-y-3 transition-all",
        isPlaying && "border-accent/40 shadow-accent/10",
        className
      )}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header Info & Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer shadow-lg",
              isPlaying
                ? "bg-accent text-[#0B0D10] scale-105 shadow-accent/30 animate-pulse"
                : "bg-surface-subtle text-accent hover:bg-accent hover:text-[#0B0D10] border border-surface-border"
            )}
            title={isPlaying ? "Pause Preview" : "Play 30s Audio Sample"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground tracking-tight truncate">
              <Disc3
                className={cn(
                  "w-3.5 h-3.5 text-accent shrink-0",
                  isPlaying && "animate-spin"
                )}
              />
              <span className="truncate">{trackName || "Music Preview"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {artistName ? `by ${artistName}` : "Official 30s Audio Sample"}
            </p>
          </div>
        </div>

        {/* Animated Sound Equalizer Bars */}
        <div className="flex items-end gap-1 h-6 px-2">
          {[40, 80, 50, 100, 60].map((h, i) => (
            <div
              key={i}
              className={cn(
                "w-1 bg-accent/40 rounded-full transition-all duration-300",
                isPlaying
                  ? "bg-accent animate-bounce"
                  : "bg-surface-border h-2"
              )}
              style={{
                height: isPlaying ? `${h}%` : "6px",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Timeline Slider & Timer */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 30}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-surface-subtle rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-danger" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
