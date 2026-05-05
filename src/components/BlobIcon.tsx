/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BlobType = 'happy' | 'neutral' | 'angry';

interface BlobIconProps {
  type: BlobType;
  size?: number;
  className?: string;
  showShadow?: boolean;
}

const COLORS = {
  happy: {
    gradient: ['#FFE88D', '#D4AF37'],
    shadow: 'rgba(212, 175, 55, 0.55)',
  },
  neutral: {
    gradient: ['#E0B0FF', '#A36ACF'],
    shadow: 'rgba(163, 106, 207, 0.45)',
  },
  angry: {
    gradient: ['#A3E4D7', '#48C9B0'],
    shadow: 'rgba(72, 201, 176, 0.5)',
  }
};

export const BlobIcon: React.FC<BlobIconProps> = ({ type, size = 40, className = '', showShadow = true }) => {
  const config = COLORS[type];
  const gradientId = `grad-${type}-${Math.random().toString(36).substr(2, 5)}`;
  const innerShadowId = `inner-${type}-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div 
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="75%" fx="30%" fy="20%">
            <stop offset="0%" stopColor={config.gradient[0]} />
            <stop offset="100%" stopColor={config.gradient[1]} />
          </radialGradient>
          <filter id={innerShadowId}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset dx="-2" dy="-2" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadow" />
            <feFlood floodColor="white" floodOpacity="0.4" />
            <feComposite in2="shadow" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* 终极有机形态：底部微偏、顶部圆润、有下垂感的面团 */}
        <path 
          d="M 15 88 Q 50 96 85 88 C 95 80 98 60 88 35 C 75 5 25 5 12 35 C 2 60 5 80 15 88 Z" 
          fill={`url(#${gradientId})`}
          filter={`url(#${innerShadowId})`}
        />
        
        {/* 精致顶部高光 */}
        <ellipse cx="32" cy="22" rx="14" ry="8" fill="white" fillOpacity="0.3" transform="rotate(-15, 32, 22)" />

        {/* 呆萌面部 - 比例更协调 */}
        <g transform="translate(0, 10)">
          {/* 直径略大一点的眼睛，更有神 */}
          <circle cx="40" cy="52" r="5" fill="#1A1C1E" />
          <circle cx="60" cy="52" r="5" fill="#1A1C1E" />

          {/* 生气角色的表情符号眉毛 */}
          {type === 'angry' && (
            <>
              <path d="M30,42 L42,46" stroke="#1A1C1E" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M70,42 L58,46" stroke="#1A1C1E" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* 嘴部 */}
          {type === 'happy' && (
            <path d="M40,65 Q50,75 60,65" stroke="#1A1C1E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          )}
          {type === 'neutral' && (
            <line x1="42" y1="68" x2="58" y2="68" stroke="#1A1C1E" strokeWidth="4.5" strokeLinecap="round" />
          )}
          {type === 'angry' && (
            <circle cx="50" cy="68" r="5.5" fill="#1A1C1E" />
          )}
        </g>
      </svg>
      
      {/* 沉稳的物理遮蔽阴影 */}
      {showShadow && (
        <div 
          className="absolute -bottom-[12%] left-1/2 -translate-x-1/2 w-[75%] h-[16%] rounded-full blur-[16px] opacity-80"
          style={{ backgroundColor: config.shadow }}
        />
      )}
    </div>
  );
};
