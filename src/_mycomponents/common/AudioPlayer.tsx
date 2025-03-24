import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  onPlay?: (audioElement: HTMLAudioElement, isPlaying: boolean) => void;
  isActive?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onPlay, isActive = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // When isActive changes to false, update local playing state
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  useEffect(() => {
    // Set up event listener for when audio ends
    if (audioRef.current) {
      const handleAudioEnd = () => {
        setIsPlaying(false);
        if (onPlay) onPlay(audioRef.current!, false);
      };
      
      audioRef.current.addEventListener('ended', handleAudioEnd);
      
      // Cleanup
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnd);
          if (isPlaying) {
            audioRef.current.pause();
          }
        }
      };
    }
  }, [isPlaying, onPlay]);

  const togglePlayPause = (e: React.MouseEvent) => {
    // This is critical to prevent form submission and navigation
    e.preventDefault();
    e.stopPropagation();
    
    if (audioRef.current) {
      const newPlayingState = !isPlaying;
      
      if (newPlayingState) {
        // Start playing
        try {
          // Make sure the audio source is set correctly
          if (audioUrl && audioUrl !== audioRef.current.src) {
            audioRef.current.src = audioUrl;
          }
          
          // Default to the fallback if no URL is provided
          if (!audioRef.current.src) {
            audioRef.current.src = '/audio/audio.mp3';
          }
          
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                if (onPlay) onPlay(audioRef.current!, true);
              })
              .catch(error => {
                console.error('Error playing audio:', error);
                setIsPlaying(false);
              });
          }
        } catch (error) {
          console.error('Unexpected error in audio playback:', error);
          setIsPlaying(false);
        }
      } else {
        // Stop playing
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        if (onPlay) onPlay(audioRef.current, false);
      }
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <audio
        ref={audioRef}
        src="/audio/audio.mp3"
        onEnded={() => {
          setIsPlaying(false);
          if (onPlay && audioRef.current) onPlay(audioRef.current, false);
        }}
      />
      <button 
        onClick={togglePlayPause} 
        className="focus:outline-none"
        type="button" // This prevents form submission
      >
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="black" />
            <path d="M9 8H11V16H9V8ZM13 8H15V16H13V8Z" fill="white" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="black" />
            <path d="M9.5 8.96524C9.5 8.48795 9.5 8.24931 9.59974 8.11608C9.68666 7.99998 9.81971 7.92734 9.96438 7.91701C10.1304 7.90515 10.3311 8.0342 10.7326 8.2923L15.4532 11.327C15.8016 11.5509 15.9758 11.6629 16.0359 11.8053C16.0885 11.9297 16.0885 12.0701 16.0359 12.1945C15.9758 12.3369 15.8016 12.4489 15.4532 12.6728L10.7326 15.7075C10.3311 15.9656 10.1304 16.0947 9.96438 16.0828C9.81971 16.0725 9.68666 15.9998 9.59974 15.8837C9.5 15.7505 9.5 15.5119 9.5 15.0346V8.96524Z" fill="white" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;