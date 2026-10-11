import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'monochrome' | 'ember' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'default',
}) => {
  const sizeMap = {
    sm: { icon: 24, font: 'text-base', gap: 'gap-2' },
    md: { icon: 32, font: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 44, font: 'text-2xl', gap: 'gap-3.5' },
    xl: { icon: 60, font: 'text-4xl', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* Geometric 'P' Mark with ember glowing core */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Subtle metallic silver gradient for the P glyph */}
          <linearGradient id="pMarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E4E4E7" />
            <stop offset="100%" stopColor="#A1A1AA" />
          </linearGradient>

          {/* Ember glowing gradient for the central spark */}
          <radialGradient id="emberSpark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFA67A" />
            <stop offset="50%" stopColor="#FF6B2C" />
            <stop offset="100%" stopColor="#C94406" />
          </radialGradient>

          {/* Core glow filter */}
          <filter id="emberGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Geometric 'P' Shape */}
        <path
          d="M20 15 H64 C79 15 90 26 90 41 C90 56 79 67 64 67 H38 V88 H20 V15 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : variant === 'light' ? '#0A0A0B' : 'url(#pMarkGradient)'}
        />

        {/* Internal Eye cutout */}
        <path
          d="M38 31 H62 C68 31 73 35.5 73 41 C73 46.5 68 51 62 51 H38 V31 Z"
          fill={variant === 'light' ? '#F2F0EB' : '#0A0A0B'}
        />

        {/* Glowing Ember Center / The Spark of the Idea */}
        {variant !== 'monochrome' && (
          <circle
            cx="55"
            cy="41"
            r="8.5"
            fill="url(#emberSpark)"
            filter="url(#emberGlowFilter)"
          />
        )}
      </svg>

      {/* Typography: IDEAPRINT */}
      {showText && (
        <span
          className={`font-display font-extrabold tracking-tight uppercase transition-colors ${
            currentSize.font
          } ${
            variant === 'light'
              ? 'text-zinc-900'
              : 'text-zinc-100 hover:text-white'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          IDEA<span className="text-zinc-300">PRINT</span>
        </span>
      )}
    </div>
  );
};
