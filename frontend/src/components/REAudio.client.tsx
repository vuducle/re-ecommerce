'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Play, Pause, Music, Volume2 } from 'lucide-react';

export default function REAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.loop = true;
      } else {
        // attempt to play (may require user gesture — this is triggered by button)
        audioRef.current.muted = false;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.18;

        await audioRef.current.play();
      }
      setIsPlaying((v) => !v);
    } catch (err) {
      // play might be blocked; keep state consistent
      console.warn('Audio play error', err);
    }
  };

  useEffect(() => {
    // pause when unmounting
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/re4-serenity.mp3"
        loop
        muted={true} // start muted until user enables via control
        preload="auto"
      />

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          aria-pressed={isPlaying}
          title={
            isPlaying ? 'Stop RE4 ambience' : 'Play RE4 ambience'
          }
          onClick={togglePlayPause}
          className={`flex items-center gap-2 rounded-full px-4 py-3 shadow-[0_10px_30px_rgba(200,30,30,0.18)] 
            bg-gradient-to-b from-[#1b0a0a] to-[#0b0606] border border-rose-800 text-rose-100
            hover:brightness-105 focus:ring-2 focus:ring-rose-600/40
            ${
              isPlaying
                ? 'ring-2 ring-rose-600/30 transform scale-[1.02] animate-pulse'
                : ''
            }`}
        >
          <span className="flex items-center gap-2">
            <Music size={18} className="text-rose-300" />
            {isPlaying ? (
              <Pause size={16} className="text-white" />
            ) : (
              <Play size={16} className="text-white" />
            )}
          </span>
          <span className="hidden sm:inline text-sm font-semibold tracking-wide">
            {isPlaying ? 'Stop' : 'Play'}
          </span>
          <span className="sr-only">
            {isPlaying ? 'Stop audio' : 'Play audio'}
          </span>
          <Volume2 size={14} className="ml-1 text-rose-400" />
        </Button>
      </div>
    </>
  );
}
