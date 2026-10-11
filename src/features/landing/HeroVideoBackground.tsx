'use client';

import React, { useRef, useEffect, useState } from 'react';

export const HeroVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const video = videoRef.current;
    if (!video || mediaQuery.matches) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => console.log('Video autoplay notice:', err));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(video);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {!isReducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-95 transition-opacity duration-700"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Blueprint Hairline Vertical Column Guides — crisp and clean without blur */}
      <div className="absolute inset-0 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 pointer-events-none grid grid-cols-6 sm:grid-cols-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-full border-r border-white/[0.04] relative"
          >
            {i === 1 && (
              <div className="absolute top-[22%] -right-[3px] w-1.5 h-1.5 bg-white/40" />
            )}
            {i === 9 && (
              <div className="absolute top-[14%] -right-[3px] w-1.5 h-1.5 rounded-full bg-ember shadow-glow-sm" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
