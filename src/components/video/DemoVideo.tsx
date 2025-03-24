'use client';

import { Play } from 'lucide-react';

interface DemoVideoProps {
  title: string;
  videoSrc: string;
}

export default function DemoVideo({ title, videoSrc }: DemoVideoProps) {
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer">
      <video
        src={videoSrc}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-12 h-12 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-white font-medium">{title}</h3>
      </div>
    </div>
  );
}
