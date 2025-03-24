import React, { useRef, useState } from "react";
import "./CustomAudioPlayer.css";
import { Pause, Play } from "lucide-react";
const CustomAudioPlayer: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Play/Pause toggle
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update current time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle progress bar change
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(event.target.value);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Update duration when audio metadata is loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle volume change

  return (
    <div className="audio-player w-[70%]">
      <audio
        ref={audioRef}
        src={audioUrl} // Replace with your audio file URL
        onTimeUpdate={handleTimeUpdate}
        preload="none"
        onLoadedMetadata={handleLoadedMetadata}
        style={{ display: "none" }}
        controls
      ></audio>
      {/* Play/Pause Button */}
      <button
        className="dark:text-gray-100 text-gray-600 "
        onClick={togglePlay}
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>
      {/* Progress Bar */}
      <input
        type="range"
        min="0"
        max={duration.toString()}
        value={currentTime}
        step="0.1"
        onChange={handleSeek}
      />

      {/* Current Time and Duration */}
      <div className="text-gray-600  dark:text-gray-100">
        {new Date(currentTime * 1000).toISOString().substring(14, 19)}
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
