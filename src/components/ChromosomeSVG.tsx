import React from 'react';
import { ChromosomeSize, OriginType } from '../types';

interface ChromosomeSVGProps {
  size: ChromosomeSize;
  origin: OriginType;
  type?: 'X' | 'I' | 'horizontal-X' | 'chromatid-upper' | 'chromatid-lower';
  showLabel?: boolean;
  isPaired?: boolean;
  highlight?: boolean;
  scale?: number;
}

export const ChromosomeSVG: React.FC<ChromosomeSVGProps> = ({
  size,
  origin,
  type = 'X',
  showLabel = true,
  isPaired = false,
  highlight = false,
  scale = 1
}) => {
  const isPaternal = origin === 'paternal';
  const strokeColor = isPaternal ? '#2563eb' : '#f43f5e';
  const fillColor = isPaternal ? '#3b82f6' : '#fb7185';
  const darkStroke = isPaternal ? '#1d4ed8' : '#e11d48';
  const lightColor = isPaternal ? '#93c5fd' : '#fecdd3';

  const w = size.w;
  const h = size.h;
  const strokeW = Math.max(5, Math.min(8, w * 0.28));
  const cx = w / 2;
  const cy = h / 2;

  if (type === 'horizontal-X') {
    const armH = Math.max(28, h * 0.65);
    const armW = Math.max(34, w * 1.15);
    const midX = armW / 2;
    const midY = armH / 2;
    const sW = Math.max(5, Math.min(7.5, armW * 0.16));
    const centromereR = sW * 0.85;

    return (
      <div 
        className={`relative inline-flex flex-col items-center justify-center select-none ${
          isPaired ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]' : 'drop-shadow-md'
        } ${highlight ? 'ring-3 ring-amber-400 rounded-2xl ring-offset-2 scale-105' : ''}`}
        style={{ transform: `scale(${scale})` }}
      >
        <svg
          width={armW}
          height={armH}
          viewBox={`0 0 ${armW} ${armH}`}
          className="overflow-visible"
        >
          {/* Upper sister chromatid meeting directly at center (midX, midY) */}
          <path
            d={`M 5 4 Q ${midX * 0.5} 4 ${midX} ${midY} Q ${armW - midX * 0.5} 4 ${armW - 5} 4`}
            stroke={fillColor}
            strokeWidth={sW}
            strokeLinecap="round"
            fill="none"
          />

          {/* Lower sister chromatid meeting directly at center (midX, midY) */}
          <path
            d={`M 5 ${armH - 4} Q ${midX * 0.5} ${armH - 4} ${midX} ${midY} Q ${armW - midX * 0.5} ${armH - 4} ${armW - 5} ${armH - 4}`}
            stroke={fillColor}
            strokeWidth={sW}
            strokeLinecap="round"
            fill="none"
          />

          {/* Central primary constriction junction disc completely binding arms together */}
          <circle
            cx={midX}
            cy={midY}
            r={centromereR + 2.5}
            fill={fillColor}
          />

          {/* Banding patterns on all 4 arms */}
          <line
            x1={midX - armW * 0.28}
            y1={midY - armH * 0.22}
            x2={midX - armW * 0.28}
            y2={midY - armH * 0.38}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={midX + armW * 0.28}
            y1={midY - armH * 0.22}
            x2={midX + armW * 0.28}
            y2={midY - armH * 0.38}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={midX - armW * 0.28}
            y1={midY + armH * 0.22}
            x2={midX - armW * 0.28}
            y2={midY + armH * 0.38}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={midX + armW * 0.28}
            y1={midY + armH * 0.22}
            x2={midX + armW * 0.28}
            y2={midY + armH * 0.38}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Central Shared Centromere (동원체) completely attached with no white gap border */}
          <circle
            cx={midX}
            cy={midY}
            r={centromereR}
            fill="#facc15"
            stroke="#b45309"
            strokeWidth={1.4}
            className="drop-shadow-xs"
          />
          <circle
            cx={midX - 1}
            cy={midY - 1}
            r={centromereR * 0.35}
            fill="#fef08a"
          />
        </svg>

        {showLabel && (
          <span
            className={`absolute -bottom-4 text-[10px] font-black px-1.5 py-0.2 rounded-full border shadow-xs whitespace-nowrap ${
              isPaternal
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
          >
            {size.name} ({isPaternal ? '부' : '모'})
          </span>
        )}
      </div>
    );
  }

  if (type === 'chromatid-upper') {
    const armH = Math.max(22, h * 0.5);
    const armW = Math.max(34, w * 1.15);
    const midX = armW / 2;
    const sW = Math.max(5, Math.min(7.5, armW * 0.16));
    const centromereR = sW * 0.75;
    const apexY = 5;

    return (
      <div 
        className={`relative inline-flex flex-col items-center justify-center select-none transition-transform ${highlight ? 'animate-pulse' : ''}`}
        style={{ transform: `scale(${scale})` }}
      >
        <svg
          width={armW}
          height={armH}
          viewBox={`0 0 ${armW} ${armH}`}
          className="overflow-visible drop-shadow-md"
        >
          {/* Upper chromatid arch meeting directly at centromere apex (midX, apexY) */}
          <path
            d={`M 5 ${armH - 4} Q ${midX * 0.6} ${apexY} ${midX} ${apexY} Q ${midX + (armW - midX) * 0.4} ${apexY} ${armW - 5} ${armH - 4}`}
            stroke={fillColor}
            strokeWidth={sW}
            strokeLinecap="round"
            fill="none"
          />

          {/* Solid junction disc ensuring 100% attached fusion with centromere */}
          <circle
            cx={midX}
            cy={apexY}
            r={centromereR + 2.5}
            fill={fillColor}
          />

          {/* Banding patterns */}
          <line
            x1={midX - armW * 0.28}
            y1={armH * 0.65}
            x2={midX - armW * 0.28}
            y2={armH * 0.35}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={midX + armW * 0.28}
            y1={armH * 0.65}
            x2={midX + armW * 0.28}
            y2={armH * 0.35}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Centromere (동원체) solidly fused at apex */}
          <circle
            cx={midX}
            cy={apexY}
            r={centromereR}
            fill="#facc15"
            stroke="#b45309"
            strokeWidth={1.4}
            className="drop-shadow-xs"
          />
          <circle
            cx={midX - 0.8}
            cy={apexY - 0.8}
            r={centromereR * 0.35}
            fill="#fef08a"
          />
        </svg>

        {showLabel && (
          <span
            className={`absolute -bottom-4 text-[10px] font-bold px-1.5 py-0.2 rounded-full border shadow-xs whitespace-nowrap ${
              isPaternal ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {size.name}
          </span>
        )}
      </div>
    );
  }

  if (type === 'chromatid-lower') {
    const armH = Math.max(22, h * 0.5);
    const armW = Math.max(34, w * 1.15);
    const midX = armW / 2;
    const sW = Math.max(5, Math.min(7.5, armW * 0.16));
    const centromereR = sW * 0.75;
    const apexY = armH - 5;

    return (
      <div 
        className={`relative inline-flex flex-col items-center justify-center select-none transition-transform ${highlight ? 'animate-pulse' : ''}`}
        style={{ transform: `scale(${scale})` }}
      >
        <svg
          width={armW}
          height={armH}
          viewBox={`0 0 ${armW} ${armH}`}
          className="overflow-visible drop-shadow-md"
        >
          {/* Lower chromatid arch meeting directly at bottom centromere apex (midX, apexY) */}
          <path
            d={`M 5 4 Q ${midX * 0.6} ${apexY} ${midX} ${apexY} Q ${midX + (armW - midX) * 0.4} ${apexY} ${armW - 5} 4`}
            stroke={fillColor}
            strokeWidth={sW}
            strokeLinecap="round"
            fill="none"
          />

          {/* Solid junction disc ensuring 100% attached fusion with centromere */}
          <circle
            cx={midX}
            cy={apexY}
            r={centromereR + 2.5}
            fill={fillColor}
          />

          {/* Banding patterns */}
          <line
            x1={midX - armW * 0.28}
            y1={armH * 0.35}
            x2={midX - armW * 0.28}
            y2={armH * 0.65}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={midX + armW * 0.28}
            y1={armH * 0.35}
            x2={midX + armW * 0.28}
            y2={armH * 0.65}
            stroke={lightColor}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Centromere (동원체) solidly fused at bottom apex */}
          <circle
            cx={midX}
            cy={apexY}
            r={centromereR}
            fill="#facc15"
            stroke="#b45309"
            strokeWidth={1.4}
            className="drop-shadow-xs"
          />
          <circle
            cx={midX - 0.8}
            cy={apexY - 0.8}
            r={centromereR * 0.35}
            fill="#fef08a"
          />
        </svg>

        {showLabel && (
          <span
            className={`absolute -bottom-4 text-[10px] font-bold px-1.5 py-0.2 rounded-full border shadow-xs whitespace-nowrap ${
              isPaternal ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {size.name}
          </span>
        )}
      </div>
    );
  }

  if (type === 'I') {
    const singleW = Math.max(w * 0.5, strokeW + 8);
    const midX = singleW / 2;
    return (
      <div 
        className={`relative inline-flex flex-col items-center justify-center select-none transition-transform ${highlight ? 'animate-pulse' : ''}`}
        style={{ transform: `scale(${scale})` }}
      >
        <svg
          width={singleW}
          height={h}
          viewBox={`0 0 ${singleW} ${h}`}
          className="overflow-visible drop-shadow-md"
        >
          {/* Main chromatid rod with rounded ends */}
          <line
            x1={midX}
            y1={strokeW / 2 + 2}
            x2={midX}
            y2={h - strokeW / 2 - 2}
            stroke={fillColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />

          {/* Gene banding stripes */}
          <line
            x1={midX - strokeW / 2 + 1}
            y1={cy - h * 0.25}
            x2={midX + strokeW / 2 - 1}
            y2={cy - h * 0.25}
            stroke={lightColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <line
            x1={midX - strokeW / 2 + 1}
            y1={cy + h * 0.25}
            x2={midX + strokeW / 2 - 1}
            y2={cy + h * 0.25}
            stroke={lightColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Centromere (동원체) */}
          <circle
            cx={midX}
            cy={cy}
            r={strokeW * 0.65}
            fill="#facc15"
            stroke="#ffffff"
            strokeWidth={1.8}
            className="drop-shadow-xs"
          />
          <circle
            cx={midX - 0.8}
            cy={cy - 0.8}
            r={strokeW * 0.25}
            fill="#fef08a"
          />
        </svg>

        {showLabel && (
          <span
            className={`absolute -bottom-4 text-[10px] font-bold px-1.5 py-0.2 rounded-full border shadow-xs whitespace-nowrap ${
              isPaternal ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {size.name}
          </span>
        )}
      </div>
    );
  }

  // Type 'X' (2 joined sister chromatids)
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        isPaired ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]' : 'drop-shadow-md'
      } ${highlight ? 'ring-3 ring-amber-400 rounded-2xl ring-offset-2 scale-105' : ''}`}
      style={{ transform: `scale(${scale})` }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="overflow-visible"
      >
        {/* Left-top to right-bottom arm */}
        <path
          d={`M 4 4 Q ${cx} ${cy} ${w - 4} ${h - 4}`}
          stroke={fillColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Right-top to left-bottom arm */}
        <path
          d={`M ${w - 4} 4 Q ${cx} ${cy} 4 ${h - 4}`}
          stroke={fillColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Banding patterns on arms */}
        <line
          x1={cx - w * 0.28}
          y1={cy - h * 0.28}
          x2={cx - w * 0.1}
          y2={cy - h * 0.22}
          stroke={lightColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1={cx + w * 0.1}
          y1={cy - h * 0.22}
          x2={cx + w * 0.28}
          y2={cy - h * 0.28}
          stroke={lightColor}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Solid primary constriction junction disc */}
        <circle
          cx={cx}
          cy={cy}
          r={strokeW * 0.7 + 2}
          fill={fillColor}
        />

        {/* Central Centromere (동원체) - Vibrant Golden Bead */}
        <circle
          cx={cx}
          cy={cy}
          r={strokeW * 0.7}
          fill="#facc15"
          stroke="#b45309"
          strokeWidth={1.5}
          className="drop-shadow-xs"
        />
        <circle
          cx={cx - 1}
          cy={cy - 1}
          r={strokeW * 0.25}
          fill="#fef08a"
        />
      </svg>

      {showLabel && (
        <span
          className={`absolute -bottom-4 text-[10px] font-black px-1.5 py-0.2 rounded-full border shadow-xs whitespace-nowrap ${
            isPaternal
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {size.name} ({isPaternal ? '부' : '모'})
        </span>
      )}
    </div>
  );
};
