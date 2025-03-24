"use client"
import { Play, Pause, Info } from "lucide-react";
import React, { useRef, useState } from "react";

type InfoVideoPlayerProps = {
    src: string; // Video source URL
    thumbnail: string; // Thumbnail image URL
    title?: string; // Optional video title
    description?: string; // Optional video description
    duration?: string; // Optional video duration (formatted as string, e.g. "3:45")
    infoPosition?: "overlay" | "below"; // Position of the info panel
};

const InfoVideoPlayer: React.FC<InfoVideoPlayerProps> = ({ 
    src, 
    thumbnail, 
    title, 
    description, 
    duration,
    infoPosition = "below" 
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [play, setPlay] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    
    const handlePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setPlay(true);
            } else {
                videoRef.current.pause();
                setPlay(false);
            }
        }
    };

    const toggleInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowInfo(!showInfo);
    };

    const renderInfoPanel = () => {
        if (!title && !description && !duration) return null;
        
        return (
            <div className="bg-gray-800 text-white p-4 rounded-b-lg">
                {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
                {duration && <div className="text-sm text-gray-300 mb-2">Duration: {duration}</div>}
                {description && <p className="text-sm">{description}</p>}
            </div>
        );
    };

    return (
        <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <div className="relative">
                <video
                    ref={videoRef}
                    className="w-full"
                    preload="none"
                    poster={thumbnail}
                    style={{ outline: "none" }}
                    controls
                >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                
                {/* Central Play/Pause Button */}
                <button
                    onClick={handlePlayPause}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-colors"
                    aria-label={play ? "Pause" : "Play"}
                >
                    {!play ? (
                        <Play className="w-8 h-8 text-white" />
                    ) : (
                        <Pause className="w-8 h-8 text-white" />
                    )}
                </button>
                
                {/* Info Button (Top Right) */}
                {(title || description || duration) && (
                    <button
                        onClick={toggleInfo}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                        aria-label="Show information"
                    >
                        <Info className="w-6 h-6 text-white" />
                    </button>
                )}
                
                {/* Overlay Info Panel */}
                {showInfo && infoPosition === "overlay" && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-6">
                        <div className="max-w-lg">
                            {title && <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>}
                            {duration && <div className="text-sm text-gray-300 mb-4">Duration: {duration}</div>}
                            {description && <p className="text-white">{description}</p>}
                            <button 
                                onClick={toggleInfo}
                                className="mt-4 bg-white text-black px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Below Info Panel */}
            {infoPosition === "below" && renderInfoPanel()}
            
            {/* Overlay Small Info When Playing */}
            {play && !showInfo && infoPosition === "overlay" && title && (
                <div className="absolute top-4 left-4 right-4 bg-black/60 text-white p-2 rounded">
                    <h4 className="font-medium">{title}</h4>
                    {duration && <span className="text-xs">{duration}</span>}
                </div>
            )}
        </div>
    );
};

export default InfoVideoPlayer;