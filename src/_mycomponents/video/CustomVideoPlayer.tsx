import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

type Video = {
    id: string;
    title: string;
    src: string;
    thumbnail: string;
};

type VideoPlayerProps = {
    videoList: Video[];
    initialVideo: Video;
};

const CustomVideoPlayer: React.FC<VideoPlayerProps> = ({ videoList, initialVideo }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(initialVideo || null);
    const [timeUpdateThrottled, setTimeUpdateThrottled] = useState(false);
    const [play, setPlay] = useState(false);
    const [volume, setVolume] = useState(1);
    const [opacity, setOpacity] = useState(1);
    const [controlWindow, setControlWindow] = useState<Window | null>(null);
    const [showThumbnail, setShowThumbnail] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);

    useEffect(() => {
        if (initialVideo) {
            setCurrentVideo(initialVideo);
        }
    }, [initialVideo]);

    // Format time from seconds to MM:SS format
    const formatTime = (timeInSeconds: number): string => {
        if (isNaN(timeInSeconds)) return "00:00";
        
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update duration when metadata is loaded
    useEffect(() => {
        const handleMetadataLoaded = () => {
            if (videoRef.current) {
                setDuration(videoRef.current.duration);
            }
        };

        // Update current time during playback
        const handleTimeUpdate = () => {
            if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                
                // Only send updates if not throttled
                if (controlWindow && !controlWindow.closed && !timeUpdateThrottled) {
                    setTimeUpdateThrottled(true);
                    
                    controlWindow.postMessage({
                        type: 'timeUpdate',
                        videoId: currentVideo?.id,
                        currentTime: videoRef.current.currentTime,
                        duration: videoRef.current.duration,
                        isPlaying: !videoRef.current.paused
                    }, '*');
                    
                    // Reset throttle after 500ms
                    setTimeout(() => {
                        setTimeUpdateThrottled(false);
                    }, 500);
                }
            }
        };

        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, [controlWindow, currentVideo, timeUpdateThrottled]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setPlay(true);
                setShowThumbnail(false);
            } else {
                videoRef.current.pause();
                setPlay(false);
                setShowThumbnail(true);
            }
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (videoRef.current) {
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            videoRef.current.volume = clampedVolume;
            setVolume(clampedVolume);
        }
    };

    const handleVideoChange = (video: Video) => {
        setCurrentVideo(video);
        setPlay(false);
        setShowThumbnail(true);
        setCurrentTime(0);
        if (videoRef.current) {
            videoRef.current.src = video.src;
            videoRef.current.load();
        }
    };

    const fadeIn = () => {
        const fadeInterval = setInterval(() => {
            setVolume(prev => {
                const newVolume = Math.min(prev + 0.1, 1);
                if (videoRef.current) videoRef.current.volume = newVolume;
                return newVolume;
            });
            setOpacity(prev => Math.min(prev + 0.1, 1));
        }, 100);
        setTimeout(() => clearInterval(fadeInterval), 1000);
    };

    const fadeOut = () => {
        const fadeInterval = setInterval(() => {
            setVolume(prev => {
                const newVolume = Math.max(prev - 0.1, 0);
                if (videoRef.current) videoRef.current.volume = newVolume;
                return newVolume;
            });
            setOpacity(prev => Math.max(prev - 0.1, 0));
        }, 100);
        setTimeout(() => clearInterval(fadeInterval), 1000);
    };
    
    const handleHold = () => {
        if (videoRef.current) {
            // Only fade out visually without changing volume
            const fadeOutInterval = setInterval(() => {
                setOpacity(prev => Math.max(prev - 0.1, 0));
            }, 100);
            
            setTimeout(() => {
                clearInterval(fadeOutInterval);
                // Pause after fade completes
                if (videoRef.current) {
                    videoRef.current.pause();
                    setPlay(false);
                }
            }, 1000);
        }
    };
    
    const handleRelease = () => {
        if (videoRef.current) {
            // Start playing first
            videoRef.current.play().catch(err => {
                console.error("Error playing video:", err);
            });
            
            setPlay(true);
            setShowThumbnail(false);
            
            // Then fade in visually
            const fadeInInterval = setInterval(() => {
                setOpacity(prev => Math.min(prev + 0.1, 1));
            }, 100);
            
            setTimeout(() => clearInterval(fadeInInterval), 1000);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (!document.fullscreenElement) {
                // Request fullscreen mode if not in fullscreen
                videoRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                // Exit fullscreen mode if already in fullscreen
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (videoRef.current) {
                if (typeof event.data === 'object') {
                    if (event.data.type === 'videoChange') {
                        const selectedVideo = videoList.find(v => v.id === event.data.videoId);
                        if (selectedVideo) {
                            handleVideoChange(selectedVideo);
                        }
                    } else if (event.data.type === 'seekTo') {
                        // Handle seeking to a specific time
                        if (typeof event.data.time === 'number') {
                            videoRef.current.currentTime = event.data.time;
                        }
                    } else if (event.data.type === 'getVideoSrc') {
                        // Respond with the current video source
                        if (controlWindow && !controlWindow.closed && currentVideo) {
                            controlWindow.postMessage({
                                type: 'videoSrcResponse',
                                src: currentVideo.src,
                                thumbnail: currentVideo.thumbnail,
                                title: currentVideo.title,
                                currentTime: videoRef.current.currentTime,
                                isPlaying: !videoRef.current.paused
                            }, '*');
                        }
                    }
                } else {
                    switch (event.data) {
                        case "play":
                            videoRef.current.play();
                            setPlay(true);
                            setShowThumbnail(false);
                            break;
                        case "pause":
                            videoRef.current.pause();
                            setPlay(false);
                            setShowThumbnail(true);
                            break;
                        case "fadeIn":
                            fadeIn();
                            break;
                        case "fadeOut":
                            fadeOut();
                            break;
                        case "fullscreen":
                            handleFullscreen();
                            break;
                        case "hold":
                            handleHold();
                            break;
                        case "release":
                            handleRelease();
                            break;
                    }
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [videoList, currentVideo, controlWindow]);
    
    const openControls = () => {
        if (!controlWindow || controlWindow.closed) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const width = Math.floor(screenWidth * 0.5);
            const height = Math.floor(screenHeight * 0.5);
            const left = Math.floor((screenWidth - width) / 2);
            const top = Math.floor((screenHeight - height) / 2);

            const newWindow = window.open('', 'ControlPanel', `width=${width},height=${height},left=${left},top=${top}`);
            if (newWindow) {
                const videoListHTML = videoList.map(video => `
                    <div class="video-item ${video.id === currentVideo?.id ? 'active' : ''}" 
                         id="video-item-${video.id}" 
                         data-src="${video.src}"
                         data-thumbnail="${video.thumbnail}"
                         onclick="window.opener.postMessage({ type: 'videoChange', videoId: '${video.id}' }, '*')">
                        <div class="video-title">${video.title}</div>
                        <div class="video-timestamp" id="timestamp-${video.id}">00:00 / 00:00</div>
                    </div>
                `).join('');

                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <title>Video Controls</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                background: linear-gradient(135deg, #3f72af 0%, #112D4E 100%);
                                font-family: -apple-system, system-ui, sans-serif;
                                color: white;
                                padding: 20px;
                            }
                            .container {
                                background: rgba(255, 255, 255, 0.1);
                                padding: 2rem;
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                                width: 100%;
                                max-width: 600px;
                            }
                            h2 {
                                margin-bottom: 1.5rem;
                                font-size: 1.25rem;
                                color: rgba(255, 255, 255, 0.9);
                                text-align: center;
                            }
                            .control-row {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                                gap: 1rem;
                                margin-bottom: 2rem;
                            }
                            .video-preview {
                                width: 100%;
                                aspect-ratio: 16/9;
                                background-color: #000;
                                margin-bottom: 1.5rem;
                                border-radius: 8px;
                                overflow: hidden;
                                position: relative;
                            }
                            .video-preview img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                            }
                            .video-preview-placeholder {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                height: 100%;
                                width: 100%;
                                font-size: 1rem;
                                color: rgba(255, 255, 255, 0.7);
                                background-color: rgba(0, 0, 0, 0.5);
                                text-align: center;
                                padding: 1rem;
                            }
                            .preview-info {
                                margin-top: 8px;
                                font-size: 0.85rem;
                                opacity: 0.8;
                            }
                            .video-thumbnail {
                                max-width: 100%;
                                max-height: 100%;
                                object-fit: contain;
                            }
                            .video-progress-container {
                                width: 100%;
                                height: 12px;
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 6px;
                                margin: 1rem 0 1.5rem;
                                cursor: pointer;
                                position: relative;
                                overflow: hidden;
                            }
                            .video-progress-bar {
                                height: 100%;
                                width: 0%;
                                background: linear-gradient(to right, #4ecca3, #45b392);
                                border-radius: 6px;
                                transition: width 0.1s linear;
                            }
                            .video-time-info {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 1rem;
                                font-size: 0.8rem;
                                color: rgba(255, 255, 255, 0.9);
                            }
                            .video-list {
                                display: flex;
                                flex-direction: column;
                                gap: 0.5rem;
                                max-height: 300px;
                                overflow-y: auto;
                            }
                            .video-item {
                                padding: 1rem;
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                text-align: left;
                                border: 2px solid transparent;
                            }
                            .video-item:hover {
                                background: rgba(255, 255, 255, 0.2);
                           
                            }
                            .video-item.active {
                                border-color: #4ecca3;
                                background: rgba(78, 204, 163, 0.2);
                            }
                            .video-title {
                                font-weight: bold;
                                margin-bottom: 4px;
                            }
                            .video-timestamp {
                                font-size: 0.8rem;
                                opacity: 0.8;
                            }
                            button {
                                padding: 12px 24px;
                                border: none;
                                border-radius: 12px;
                                background: rgba(255, 255, 255, 0.1);
                                color: white;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                font-size: 0.9rem;
                            }
                            button:hover {
                                background: rgba(255, 255, 255, 0.2);
                             
                            }
                            .play { background: rgba(76, 175, 80, 0.3); }
                            .pause { background: rgba(244, 67, 54, 0.3); }
                            .fade-in { background: rgba(63, 114, 175, 0.3); }
                            .fade-out { background: rgba(156, 39, 176, 0.3); }
                            .hold { background: rgba(255, 193, 7, 0.3); }
                            .release { background: rgba(33, 150, 243, 0.3); }
                            .fullscreen { background: rgba(255, 152, 0, 0.3); }
                            .play-preview {
                                background: rgba(76, 175, 80, 0.5);
                                position: absolute;
                                bottom: 10px;
                                left: 50%;
                                transform: translateX(-50%);
                                padding: 6px 12px;
                                border-radius: 30px;
                                font-size: 0.8rem;
                                z-index: 10;
                            }
                            .hidden {
                                display: none !important;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Video Controls</h2>
                            
                            <div class="video-preview" id="video-preview">
                                <video id="preview-video" class="hidden" muted></video>
                                <img id="preview-thumbnail" class="video-thumbnail hidden" src="" alt="Video thumbnail" />
                                <div class="video-preview-placeholder" id="preview-placeholder">
                                    Select a video to play
                                </div>
                                <button id="preview-play-button" class="play-preview hidden" onclick="enablePreviewVideo()">
                                    Enable Live Preview
                                </button>
                            </div>
                            
                            <div class="video-time-info">
                                <span id="current-time">00:00</span>
                                <span id="total-time">00:00</span>
                            </div>
                            
                            <div class="video-progress-container" id="progress-container">
                                <div class="video-progress-bar" id="progress-bar"></div>
                            </div>
                            
                            <div class="control-row">
                                <button class="play" onclick="window.opener.postMessage('play', '*')">Play</button>
                                <button class="pause" onclick="window.opener.postMessage('pause', '*')">Pause</button>
                                <button class="fade-in" onclick="window.opener.postMessage('fadeIn', '*')">Fade In</button>
                                <button class="fade-out" onclick="window.opener.postMessage('fadeOut', '*')">Fade Out</button>
                                <button class="hold" id="hold-button" onclick="toggleHold()">On Hold</button>
                                <button class="fullscreen" onclick="window.opener.postMessage('fullscreen', '*')">
                                    Toggle Fullscreen
                                </button>
                            </div>
                            
                            <h2>Available Videos</h2>
                            <div class="video-list">
                                ${videoListHTML}
                            </div>
                        </div>
                        
                        <script>
                            // Variables to store video information
                            let activeVideoId = null;
                            let currentDuration = 0;
                            let currentVideoSrc = '';
                            let currentThumbnail = '';
                            let currentVideoTitle = '';
                            let isVideoPlaying = false;
                            let isOnHold = false;
                            let isPreviewEnabled = false;
                            let previewPlayThrottled = false;
                            let updatePreviewThrottled = false;
                            let lastRequestTime = 0;
                            
                            // DOM Elements
                            const progressBar = document.getElementById('progress-bar');
                            const progressContainer = document.getElementById('progress-container');
                            const currentTimeEl = document.getElementById('current-time');
                            const totalTimeEl = document.getElementById('total-time');
                            const videoPreviewEl = document.getElementById('video-preview');
                            const previewVideoEl = document.getElementById('preview-video');
                            const previewThumbnailEl = document.getElementById('preview-thumbnail');
                            const previewPlaceholderEl = document.getElementById('preview-placeholder');
                            const previewPlayButtonEl = document.getElementById('preview-play-button');
                            const holdButton = document.getElementById('hold-button');
                            
                            // Set styles directly on elements to ensure consistency
                            if (previewVideoEl) {
                                previewVideoEl.style.width = '100%';
                                previewVideoEl.style.height = '100%';
                                previewVideoEl.style.objectFit = 'contain';
                                previewVideoEl.setAttribute('playsinline', '');
                                previewVideoEl.setAttribute('webkit-playsinline', '');
                            }
                            
                            // Function to enable video preview
                            function enablePreviewVideo() {
                                if (previewVideoEl && previewPlayButtonEl) {
                                    isPreviewEnabled = true;
                                    previewPlayButtonEl.classList.add('hidden');
                                    
                                    // Show video and hide thumbnail
                                    previewVideoEl.classList.remove('hidden');
                                    previewVideoEl.style.display = 'block';
                                    
                                    if (previewThumbnailEl) {
                                        previewThumbnailEl.classList.add('hidden');
                                        previewThumbnailEl.style.display = 'none';
                                    }
                                    
                                    if (previewPlaceholderEl) {
                                        previewPlaceholderEl.classList.add('hidden');
                                        previewPlaceholderEl.style.display = 'none';
                                    }
                                    
                                    // Request latest video info
                                    window.opener.postMessage({
                                        type: 'getVideoSrc'
                                    }, '*');
                                }
                            }
                            
                            // Handle progress bar clicks for seeking
                            progressContainer.addEventListener('click', function(e) {
                                if (!currentDuration) return;
                                
                                // Calculate seek position
                                const rect = this.getBoundingClientRect();
                                const position = (e.clientX - rect.left) / rect.width;
                                const seekTime = position * currentDuration;
                                
                                // Send seek command to main window
                                window.opener.postMessage({
                                    type: 'seekTo',
                                    time: seekTime
                                }, '*');
                            });
                            
                            // Hold/Release toggle function
                            function toggleHold() {
                                if (!isOnHold) {
                                    // Switch to hold mode
                                    window.opener.postMessage('hold', '*');
                                    holdButton.textContent = 'Release';
                                    holdButton.classList.remove('hold');
                                    holdButton.classList.add('release');
                                    isOnHold = true;
                                } else {
                                    // Switch to release mode
                                    window.opener.postMessage('release', '*');
                                    holdButton.textContent = 'On Hold';
                                    holdButton.classList.remove('release');
                                    holdButton.classList.add('hold');
                                    isOnHold = false;
                                }
                            }
                            
                            // Listen for messages from the main window
                            window.addEventListener('message', function(event) {
                                if (typeof event.data === 'object') {
                                    if (event.data.type === 'videoSrcResponse') {
                                        // Get video source from main window
                                        if (event.data.src) {
                                            currentVideoSrc = event.data.src;
                                            currentThumbnail = event.data.thumbnail || '';
                                            currentVideoTitle = event.data.title || '';
                                            
                                            // Update thumbnail if available
                                            if (previewThumbnailEl && currentThumbnail) {
                                                previewThumbnailEl.src = currentThumbnail;
                                                
                                                if (!isPreviewEnabled) {
                                                    previewThumbnailEl.classList.remove('hidden');
                                                    previewThumbnailEl.style.display = 'block';
                                                    
                                                    if (previewPlaceholderEl) {
                                                        previewPlaceholderEl.classList.add('hidden');
                                                        previewPlaceholderEl.style.display = 'none';
                                                    }
                                                }
                                            }
                                            
                                            // Update preview video if enabled
                                            if (isPreviewEnabled && previewVideoEl) {
                                                // Only update source if it has changed
                                                if (previewVideoEl.src !== currentVideoSrc) {
                                                    previewVideoEl.src = currentVideoSrc;
                                                    previewVideoEl.currentTime = event.data.currentTime || 0;
                                                }
                                                
                                                // Try to play if main video is playing
                                                if (event.data.isPlaying && previewVideoEl.paused && !previewPlayThrottled) {
                                                    previewPlayThrottled = true;
                                                    // Using play() with muted attribute should bypass autoplay restrictions
                                                    previewVideoEl.muted = true;
                                                    previewVideoEl.play().catch(e => {
                                                        console.log('Preview playback error:', e);
                                                    });
                                                    
                                                    setTimeout(() => {
                                                        previewPlayThrottled = false;
                                                    }, 3000);
                                                }
                                            }
                                        }
                                    } else if (event.data.type === 'timeUpdate') {
                                        // Update video timestamp
                                        const videoId = event.data.videoId;
                                        const currentTime = event.data.currentTime;
                                        const duration = event.data.duration;
                                        const isPlaying = event.data.isPlaying;
                                        
                                        // Store current information
                                        activeVideoId = videoId;
                                        currentDuration = duration;
                                        isVideoPlaying = isPlaying;
                                        
                                        // Update current/total time
                                        currentTimeEl.textContent = formatTime(currentTime);
                                        totalTimeEl.textContent = formatTime(duration);
                                        
                                        // Update progress bar
                                        const progress = (currentTime / duration) * 100;
                                        progressBar.style.width = progress + '%';
                                        
                                        // Update timestamp for specific video
                                        const timestampElement = document.getElementById('timestamp-' + videoId);
                                        if (timestampElement) {
                                            timestampElement.textContent = formatTime(currentTime) + ' / ' + formatTime(duration);
                                        }
                                        
                                        // Highlight the active video
                                        document.querySelectorAll('.video-item').forEach(el => {
                                            el.classList.remove('active');
                                        });
                                        
                                        const activeItem = document.getElementById('video-item-' + videoId);
                                        if (activeItem) {
                                            activeItem.classList.add('active');
                                            
                                            // Get video details
                                            const videoTitle = activeItem.querySelector('.video-title').textContent;
                                            const videoSrc = activeItem.getAttribute('data-src');
                                            const thumbnailSrc = activeItem.getAttribute('data-thumbnail');
                                            
                                            currentVideoTitle = videoTitle || '';
                                            
                                            // Update thumbnail if available
                                            if (previewThumbnailEl && thumbnailSrc && !isPreviewEnabled) {
                                                previewThumbnailEl.src = thumbnailSrc;
                                                previewThumbnailEl.classList.remove('hidden');
                                                previewThumbnailEl.style.display = 'block';
                                                
                                                if (previewPlaceholderEl) {
                                                    previewPlaceholderEl.classList.add('hidden');
                                                    previewPlaceholderEl.style.display = 'none';
                                                }
                                            }
                                            
                                            // Show preview enable
                                            // Show preview button
                                            if (previewPlayButtonEl && !isPreviewEnabled) {
                                                previewPlayButtonEl.classList.remove('hidden');
                                                previewPlayButtonEl.style.display = 'block';
                                            }
                                            
                                            // Update preview video if enabled
                                            if (isPreviewEnabled && previewVideoEl) {
                                                // Only adjust time if difference is significant to prevent constant seeking
                                                if (Math.abs(previewVideoEl.currentTime - currentTime) > 1.5) {
                                                    previewVideoEl.currentTime = currentTime;
                                                }
                                                
                                                // Match play/pause state with throttling to prevent blinking
                                                if (isPlaying && previewVideoEl.paused) {
                                                    if (!previewPlayThrottled) {
                                                        previewPlayThrottled = true;
                                                        previewVideoEl.play().catch(e => {
                                                            console.log('Preview playback error:', e);
                                                        });
                                                        setTimeout(() => { previewPlayThrottled = false; }, 2000);
                                                    }
                                                } else if (!isPlaying && !previewVideoEl.paused) {
                                                    previewVideoEl.pause();
                                                }
                                            } else if (!isPreviewEnabled) {
                                                // Add info text to thumbnail area if not already present
                                                let infoText = document.querySelector('.preview-info');
                                                if (!infoText) {
                                                    infoText = document.createElement('div');
                                                    infoText.className = 'preview-info';
                                                    videoPreviewEl.appendChild(infoText);
                                                }
                                                
                                                if (infoText) {
                                                    infoText.textContent = isPlaying ? '▶️ Playing' : '⏸️ Paused';
                                                }
                                            }
                                            
                                            // Request the absolute path if preview is enabled, but throttle requests
                                            if (isPreviewEnabled) {
                                                const now = Date.now();
                                                if (now - lastRequestTime > 2000 && !updatePreviewThrottled) {
                                                    updatePreviewThrottled = true;
                                                    lastRequestTime = now;
                                                    
                                                    window.opener.postMessage({
                                                        type: 'getVideoSrc'
                                                    }, '*');
                                                    
                                                    setTimeout(() => {
                                                        updatePreviewThrottled = false;
                                                    }, 2000);
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            
                            // Format time helper function
                            function formatTime(seconds) {
                                if (isNaN(seconds)) return "00:00";
                                const minutes = Math.floor(seconds / 60);
                                const secs = Math.floor(seconds % 60);
                                return minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
                            }
                        </script>
                    </body>
                    </html>
                `);
                newWindow.document.close();
                setControlWindow(newWindow);
                
                // Send initial video state if video is already playing
                if (videoRef.current && currentVideo) {
                    setTimeout(() => {
                        if (newWindow && !newWindow.closed && videoRef.current) {
                            newWindow.postMessage({
                                type: 'timeUpdate',
                                videoId: currentVideo.id,
                                currentTime: videoRef.current.currentTime,
                                duration: videoRef.current.duration,
                                isPlaying: !videoRef.current.paused
                            }, '*');
                        }
                    }, 500);
                }
            } else if (controlWindow) {
                controlWindow.focus();
            }
        }
    };

    return (
        <div className="w-full">
            <div className="relative">
                {showThumbnail && currentVideo && (
                    <img
                        src={currentVideo.thumbnail}
                        alt="Video thumbnail"
                        className="absolute top-0 left-0 w-full h-full object-cover z-10"
                    />
                )}
                {currentVideo && (
                    <video 
                        ref={videoRef} 
                        className="w-full transition-opacity duration-300" 
                        preload="none" 
                        style={{ opacity }}
                    >
                        <source src={currentVideo.src} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-20 items-center">
                    <button 
                        onClick={openControls} 
                        className="bg-[#3F72AF] px-4 py-2 rounded-lg text-white"
                    >
                        Open Controls
                    </button>

                    <button 
                        onClick={handleFullscreen} 
                        className="bg-[#3F72AF] px-4 py-2 rounded-lg text-white"
                    >
                        {isFullscreen ? (
                            <Minimize className="w-5 h-5" />
                        ) : (
                            <Maximize className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;