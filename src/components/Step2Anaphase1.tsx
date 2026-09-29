import React, { useState, useEffect, useRef } from 'react';
import { PAIR_SIZES } from '../data/chromosomes';
import { ChromosomeItem, OriginType } from '../types';
import { ChromosomeSVG } from './ChromosomeSVG';
import { sound } from '../utils/audio';
import { CheckCircle2, Wand2, ArrowLeftRight } from 'lucide-react';

interface Step2Anaphase1Props {
  onComplete: () => void;
  showToast: (msg: string) => void;
}

export const Step2Anaphase1: React.FC<Step2Anaphase1Props> = ({ onComplete, showToast }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chromosomes, setChromosomes] = useState<ChromosomeItem[]>([]);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [separatedCount, setSeparatedCount] = useState(0);

  const dragInfo = useRef<{
    id: string | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ id: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  // Initialize aligned on equatorial plate
  const initPositions = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 500;

    const items: ChromosomeItem[] = [];
    const centerY = h * 0.5;
    const spacingY = Math.min(125, (h * 0.65) / PAIR_SIZES.length);

    PAIR_SIZES.forEach((size, idx) => {
      const posY = centerY + (idx - 1) * spacingY - size.h / 2;

      // Paternal on left side of equator
      const patX = w / 2 - size.w - 14;
      // Maternal on right side of equator
      const matX = w / 2 + 14;

      items.push({
        id: `chr-${size.id}-pat`,
        pairId: size.id,
        origin: 'paternal',
        size,
        x: patX,
        y: posY,
        pole: undefined
      });

      items.push({
        id: `chr-${size.id}-mat`,
        pairId: size.id,
        origin: 'maternal',
        size,
        x: matX,
        y: posY,
        pole: undefined
      });
    });

    setChromosomes(items);
    setSeparatedCount(0);
  };

  useEffect(() => {
    initPositions();
    const handleResize = () => initPositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent, item: ChromosomeItem) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDraggingId(item.id);
    dragInfo.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current.id || !containerRef.current) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    const newX = dragInfo.current.origX + dx;
    const newY = dragInfo.current.origY + dy;

    setChromosomes((prev) =>
      prev.map((c) => (c.id === dragInfo.current.id ? { ...c, x: newX, y: newY } : c))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragInfo.current.id || !containerRef.current) return;
    const draggedId = dragInfo.current.id;
    dragInfo.current.id = null;
    setActiveDraggingId(null);

    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const leftPoleX = 60;
    const rightPoleX = w - 60;

    const dragged = chromosomes.find((c) => c.id === draggedId);
    if (!dragged) return;

    const isLeftZone = dragged.x < w * 0.35;
    const isRightZone = dragged.x > w * 0.65;

    if (isLeftZone || isRightZone) {
      const assignedPole = isLeftZone ? 'left' : 'right';
      const snapX = isLeftZone ? leftPoleX + 40 : rightPoleX - 40 - dragged.size.w;

      if (dragged.pole !== assignedPole) {
        sound.playSnap();
        showToast(`⚡ ${dragged.size.name} (${dragged.origin === 'paternal' ? '부계' : '모계'}) ${isLeftZone ? '왼쪽 극' : '오른쪽 극'}으로 이동!`);
      }

      const updated = chromosomes.map((c) =>
        c.id === draggedId ? { ...c, x: snapX, pole: assignedPole } : c
      );

      setChromosomes(updated);

      const newCount = updated.filter((c) => c.pole !== undefined).length;
      setSeparatedCount(newCount);

      if (newCount === 6) {
        sound.playSuccess();
        onComplete();
        showToast('🎉 상동염색체가 모두 양극으로 분리되었습니다! [개념 퀴즈]로 이동하세요.');
      }
    }
  };

  const handleAutoSeparate = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 500;
    const centerY = h * 0.5;
    const spacingY = Math.min(125, (h * 0.65) / PAIR_SIZES.length);
    const leftPoleX = 60;
    const rightPoleX = w - 60;

    sound.playSuccess();
    const updated = chromosomes.map((c) => {
      const idx = c.pairId - 1;
      const targetY = centerY + (idx - 1) * spacingY - c.size.h / 2;
      const isLeft = c.origin === 'paternal';
      return {
        ...c,
        x: isLeft ? leftPoleX + 40 : rightPoleX - 40 - c.size.w,
        y: targetY,
        pole: isLeft ? ('left' as const) : ('right' as const)
      };
    });

    setChromosomes(updated);
    setSeparatedCount(6);
    onComplete();
    showToast('상동염색체 3쌍이 양극으로 완벽히 분리되었습니다!');
  };

  return (
    <div className="relative w-full flex-1 flex flex-col p-2 sm:p-4 select-none touch-pan-y overflow-hidden">
      {/* 1. Top Control Bar: Status on Left, Auto Separate on Top-Right */}
      <div className="w-full flex items-center justify-between gap-3 mb-2 px-2 z-20 shrink-0">
        <div className="bg-indigo-900 text-white border-2 border-indigo-700 px-4 py-2 rounded-2xl shadow-md flex items-center gap-3">
          <ArrowLeftRight className="w-4 h-4 text-cyan-300" />
          <span className="text-xs sm:text-sm font-bold text-indigo-100">
            양극 분리 진행도:{' '}
            <span className="text-cyan-300 text-sm sm:text-base font-black">{separatedCount}</span> / 6 개
          </span>
        </div>

        {/* Top-Right Action Button */}
        <button
          onClick={handleAutoSeparate}
          className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-2 border-cyan-300 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Wand2 className="w-4 h-4 text-cyan-600" />
          <span>자동 양극 분리</span>
        </button>
      </div>

      {/* 2. Cell Model Area: Centered strictly underneath top bar with NO overlap */}
      <div className="relative flex-1 w-full min-h-[500px] sm:min-h-[540px] flex items-center justify-center overflow-hidden touch-pan-y">
        {/* Cell Body Container (Self-contained unified coordinate system) */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full max-w-4xl h-[480px] sm:h-[520px] border-4 border-dashed border-sky-300 rounded-[56px] sm:rounded-[64px] bg-gradient-to-r from-blue-50/75 via-white to-red-50/75 shadow-inner select-none overflow-hidden"
        >
          {/* Left Centrosome / Pole */}
          <div className="absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-base font-black">
              L
            </div>
            <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-100/95 px-3 py-1 rounded-full border border-blue-300 shadow-xs">
              왼쪽 극 (딸세포 1)
            </span>
            <span className="text-xs text-indigo-900 font-bold bg-white/90 px-3 py-0.5 rounded-full border border-indigo-100 shadow-xs">
              염색체: <strong className="text-blue-600 font-black">{chromosomes.filter((c) => c.pole === 'left').length}</strong> / 3개
            </span>
          </div>

          {/* Central Equatorial Plate (적도면) with Spindle Center */}
          <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="h-[90%] w-0.5 border-l-2 border-dashed border-rose-400 opacity-75" />
            <span className="absolute top-4 text-xs sm:text-sm font-black text-rose-700 bg-rose-50 px-4 py-1 rounded-full border-2 border-rose-200 shadow-xs">
              적도면
            </span>
            <span className="absolute bottom-4 text-xs font-bold text-slate-500 bg-white/90 px-3 py-0.5 rounded-full border border-slate-200">
              세포질 만입부
            </span>
          </div>

          {/* Right Centrosome / Pole */}
          <div className="absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-base font-black">
              R
            </div>
            <span className="text-xs sm:text-sm font-black text-rose-700 bg-rose-100/95 px-3 py-1 rounded-full border border-rose-300 shadow-xs">
              오른쪽 극 (딸세포 2)
            </span>
            <span className="text-xs text-indigo-900 font-bold bg-white/90 px-3 py-0.5 rounded-full border border-indigo-100 shadow-xs">
              염색체: <strong className="text-rose-600 font-black">{chromosomes.filter((c) => c.pole === 'right').length}</strong> / 3개
            </span>
          </div>

          {/* SVG Spindle Fibers Layer - Perfectly unified with L and R centrosome coordinates */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {(() => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return null;
              const w = rect.width;
              const h = rect.height;
              const leftPoleX = 60;
              const rightPoleX = w - 60;
              const poleY = h * 0.5;

              return (
                <g id="spindle-fibers-group">
                  {/* Centrosome Aster Rays (중심체 성상체 방사선) */}
                  {[-30, -15, 0, 15, 30].map((angle, i) => (
                    <g key={`aster-${i}`}>
                      <line
                        x1={leftPoleX}
                        y1={poleY}
                        x2={leftPoleX + 34 * Math.cos((angle * Math.PI) / 180)}
                        y2={poleY + 34 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#94a3b8"
                        strokeWidth={1.8}
                        strokeDasharray="3,3"
                        opacity={0.7}
                      />
                      <line
                        x1={rightPoleX}
                        y1={poleY}
                        x2={rightPoleX - 34 * Math.cos((angle * Math.PI) / 180)}
                        y2={poleY + 34 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#94a3b8"
                        strokeWidth={1.8}
                        strokeDasharray="3,3"
                        opacity={0.7}
                      />
                    </g>
                  ))}

                  {/* Spindle Fibers to each chromosome centromere (부계-왼쪽극, 모계-오른쪽극 1:1 연결) */}
                  {chromosomes.map((c) => {
                    const chrCenterX = c.x + c.size.w / 2;
                    const chrCenterY = c.y + c.size.h / 2;
                    const isDragging = activeDraggingId === c.id;
                    const isPaternal = c.origin === 'paternal';

                    // 왼쪽 극은 부계(푸른색), 오른쪽 극은 모계(붉은색) 염색체의 동원체에만 방추사가 연결됨
                    const poleX = isPaternal ? leftPoleX : rightPoleX;

                    return (
                      <g key={`spindle-${c.id}`}>
                        <line
                          x1={poleX}
                          y1={poleY}
                          x2={chrCenterX}
                          y2={chrCenterY}
                          stroke="#94a3b8"
                          strokeWidth={isDragging ? 3.2 : 2.4}
                          strokeDasharray="5,3.5"
                          strokeLinecap="round"
                          opacity={isDragging ? 1.0 : 0.85}
                        />
                        <circle
                          cx={chrCenterX}
                          cy={chrCenterY}
                          r={isDragging ? 3.8 : 3.0}
                          fill="#facc15"
                          stroke="#94a3b8"
                          strokeWidth={1.5}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </svg>

          {/* Chromosomes layer inside Cell Body */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {chromosomes.map((item) => {
              const isDragging = activeDraggingId === item.id;
              return (
                <div
                  key={item.id}
                  id={`chr-step2-${item.id}`}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.size.w}px`,
                    height: `${item.size.h}px`,
                    touchAction: 'none',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: isDragging ? 50 : 20,
                    transform: isDragging ? 'scale(1.15)' : 'scale(1)',
                    transition: isDragging ? 'none' : 'transform 0.15s ease',
                    pointerEvents: 'auto'
                  }}
                  className="group flex items-center justify-center"
                >
                  <ChromosomeSVG
                    size={item.size}
                    origin={item.origin}
                    type="X"
                    highlight={isDragging}
                    isPaired={item.pole !== undefined}
                  />
                </div>
              );
            })}
          </div>

          {/* Completion Banner */}
          {separatedCount === 6 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-xl border-2 border-indigo-300 flex items-center gap-3 animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-indigo-100" />
              <div>
                <div className="font-bold text-sm">상동염색체 분리 완료! (1분열 완료)</div>
                <div className="text-xs text-indigo-100">각 극으로 3개씩 이동: 2n=6 → n=3 반감</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
