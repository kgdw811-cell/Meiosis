import React, { useState, useEffect, useRef } from 'react';
import { PAIR_SIZES } from '../data/chromosomes';
import { ChromosomeSize, OriginType } from '../types';
import { ChromosomeSVG } from './ChromosomeSVG';
import { sound } from '../utils/audio';
import { CheckCircle2, Wand2, ArrowUpDown } from 'lucide-react';

interface Step3Meiosis2Props {
  onComplete: () => void;
  showToast: (msg: string) => void;
}

export interface ChromatidItem {
  id: string;
  cellIndex: 0 | 1; // 0: Left cell (Paternal), 1: Right cell (Maternal)
  pairId: number;
  origin: OriginType;
  size: ChromosomeSize;
  targetPole: 'upper' | 'lower';
  x: number;
  y: number;
  isSplit: boolean; // Whether centromere has been split by click
  pole?: 'upper' | 'lower'; // Set when successfully dragged to pole
}

export const Step3Meiosis2: React.FC<Step3Meiosis2Props> = ({ onComplete, showToast }) => {
  const cell0Ref = useRef<HTMLDivElement>(null);
  const cell1Ref = useRef<HTMLDivElement>(null);
  const [chromatids, setChromatids] = useState<ChromatidItem[]>([]);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [separatedCount, setSeparatedCount] = useState(0);

  const dragInfo = useRef<{
    id: string | null;
    cellIndex: 0 | 1;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ id: null, cellIndex: 0, startX: 0, startY: 0, origX: 0, origY: 0 });

  const initPositions = () => {
    const list: ChromatidItem[] = [];

    // Initialize for Cell 0 (Paternal) and Cell 1 (Maternal)
    [0, 1].forEach((cellIdx) => {
      const cellRef = cellIdx === 0 ? cell0Ref.current : cell1Ref.current;
      const rect = cellRef?.getBoundingClientRect();
      const cellW = rect?.width || 340;
      const cellH = rect?.height || 420;
      const origin: OriginType = cellIdx === 0 ? 'paternal' : 'maternal';

      PAIR_SIZES.forEach((size, idx) => {
        const armW = Math.max(34, size.w * 1.15);
        const chrArmH = Math.max(22, size.h * 0.5);
        const colX = (idx + 0.5) * (cellW / PAIR_SIZES.length) - armW / 2;
        const centerY = cellH * 0.5;

        // Upper Sister Chromatid (sits slightly above equator when split)
        list.push({
          id: `chr-cell${cellIdx}-${size.id}-upper`,
          cellIndex: cellIdx as 0 | 1,
          pairId: size.id,
          origin,
          size,
          targetPole: 'upper',
          x: colX,
          y: centerY - chrArmH - 8,
          isSplit: false,
          pole: undefined
        });

        // Lower Sister Chromatid (sits slightly below equator when split)
        list.push({
          id: `chr-cell${cellIdx}-${size.id}-lower`,
          cellIndex: cellIdx as 0 | 1,
          pairId: size.id,
          origin,
          size,
          targetPole: 'lower',
          x: colX,
          y: centerY + 8,
          isSplit: false,
          pole: undefined
        });
      });
    });

    setChromatids(list);
    setSeparatedCount(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initPositions();
    }, 60);

    const handleResize = () => initPositions();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 1) Click on unified chromosome at equator to split its centromere into sister chromatids
  const handleSplitChromosome = (cellIndex: 0 | 1, pairId: number) => {
    sound.playSnap();
    const size = PAIR_SIZES.find((s) => s.id === pairId);
    showToast(`⚡ ${size?.name || ''} 동원체 분리 완료! 이제 각각의 자매염색분체를 위와 아래 극으로 드래그하세요.`);

    setChromatids((prev) =>
      prev.map((c) =>
        c.cellIndex === cellIndex && c.pairId === pairId
          ? { ...c, isSplit: true }
          : c
      )
    );
  };

  // 2) Pointer down to initiate drag of an individual separated chromatid
  const handlePointerDown = (e: React.PointerEvent, item: ChromatidItem) => {
    if (!item.isSplit || item.pole) return;
    e.preventDefault();
    e.stopPropagation();

    setActiveDraggingId(item.id);
    dragInfo.current = {
      id: item.id,
      cellIndex: item.cellIndex,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y
    };
  };

  // Robust global drag listeners attached during active drag
  useEffect(() => {
    if (!activeDraggingId) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!dragInfo.current.id) return;
      const dy = e.clientY - dragInfo.current.startY;
      const dx = e.clientX - dragInfo.current.startX;

      const cellRef = dragInfo.current.cellIndex === 0 ? cell0Ref.current : cell1Ref.current;
      const cellH = cellRef?.getBoundingClientRect().height || 420;
      const cellW = cellRef?.getBoundingClientRect().width || 340;

      // Allow natural vertical dragging with slight horizontal flexibility
      const newX = Math.max(10, Math.min(cellW - 50, dragInfo.current.origX + dx * 0.6));
      const newY = Math.max(10, Math.min(cellH - 60, dragInfo.current.origY + dy));

      setChromatids((prev) =>
        prev.map((c) => (c.id === dragInfo.current.id ? { ...c, x: newX, y: newY } : c))
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      const draggedId = dragInfo.current.id;
      if (!draggedId) return;
      const cellIdx = dragInfo.current.cellIndex;
      const startX = dragInfo.current.startX;
      const startY = dragInfo.current.startY;
      const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);

      dragInfo.current.id = null;
      setActiveDraggingId(null);

      const cellRef = cellIdx === 0 ? cell0Ref.current : cell1Ref.current;
      const cellH = cellRef?.getBoundingClientRect().height || 420;
      const cellW = cellRef?.getBoundingClientRect().width || 340;
      const centerY = cellH * 0.5;

      const dragged = chromatids.find((c) => c.id === draggedId);
      if (!dragged) return;

      const armW = Math.max(34, dragged.size.w * 1.15);
      const chrArmH = Math.max(22, dragged.size.h * 0.5);
      const defaultColX = (dragged.pairId - 0.5) * (cellW / PAIR_SIZES.length) - armW / 2;

      // If user clicked without dragging, guide them to drag
      if (totalDist < 8) {
        showToast(`👆 ${dragged.size.name} 염색분체를 ${dragged.targetPole === 'upper' ? '위쪽 극 영역으로 위로' : '아래쪽 극 영역으로 아래로'} 직접 드래그하세요!`);
        return;
      }

      // Check if dragged to destination pole zone:
      // Upper zone: top 38% of cell
      // Lower zone: bottom 38% of cell
      const isUpperZone = dragged.y < cellH * 0.38;
      const isLowerZone = dragged.y > cellH * 0.56;

      let targetAssigned: 'upper' | 'lower' | undefined = undefined;
      let targetY = dragged.y;

      if (dragged.targetPole === 'upper' && isUpperZone) {
        targetAssigned = 'upper';
        targetY = cellH * 0.16 + (dragged.pairId % 2 === 0 ? -4 : 6);
      } else if (dragged.targetPole === 'lower' && isLowerZone) {
        targetAssigned = 'lower';
        targetY = cellH * 0.72 + (dragged.pairId % 2 === 0 ? 6 : -4);
      } else {
        // Did not reach the pole zone - snap back to equator resting position
        sound.playSnap();
        const restY = dragged.targetPole === 'upper' ? centerY - chrArmH - 8 : centerY + 8;
        showToast(`💡 ${dragged.size.name} 자매염색분체를 ${dragged.targetPole === 'upper' ? '위쪽 극' : '아래쪽 극'}까지 끝까지 드래그하세요!`);

        setChromatids((prev) =>
          prev.map((c) =>
            c.id === draggedId ? { ...c, x: defaultColX, y: restY, pole: undefined } : c
          )
        );
        return;
      }

      if (targetAssigned) {
        sound.playSnap();
        showToast(`⚡ ${dragged.size.name} 자매염색분체 ${targetAssigned === 'upper' ? '위쪽' : '아래쪽'} 극으로 이동 완료!`);

        const updated = chromatids.map((c) =>
          c.id === draggedId ? { ...c, x: defaultColX, y: targetY, pole: targetAssigned } : c
        );
        setChromatids(updated);

        const newCount = updated.filter((c) => c.pole !== undefined).length;
        setSeparatedCount(newCount);

        if (newCount === 12) {
          sound.playSuccess();
          onComplete();
          showToast('🎉 감수 2분열 완료! 총 4개의 생식세포 딸세포(n=3)가 형성되었습니다.');
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [activeDraggingId, chromatids, onComplete, showToast]);

  const handleAutoSeparate = () => {
    sound.playSuccess();
    const updated = chromatids.map((c) => {
      const cellRef = c.cellIndex === 0 ? cell0Ref.current : cell1Ref.current;
      const cellH = cellRef?.getBoundingClientRect().height || 420;
      const targetY =
        c.targetPole === 'upper'
          ? cellH * 0.16 + (c.pairId % 2 === 0 ? -4 : 6)
          : cellH * 0.72 + (c.pairId % 2 === 0 ? 6 : -4);

      return {
        ...c,
        isSplit: true,
        y: targetY,
        pole: c.targetPole
      };
    });

    setChromatids(updated);
    setSeparatedCount(12);
    onComplete();
    showToast('모든 염색체의 동원체가 분리되고 양극으로 이동 완료되었습니다!');
  };

  const splitCount = Math.floor(chromatids.filter((c) => c.isSplit).length / 2);

  return (
    <div className="relative w-full h-full bg-slate-900/5 select-none overflow-hidden touch-none flex flex-col p-2 sm:p-4">
      {/* Top Floating Helper Controls */}
      <div className="relative z-20 px-2 flex flex-wrap items-center justify-between gap-2 pointer-events-auto mb-2">
        <div className="bg-indigo-900 text-white border-2 border-indigo-700 px-4 py-1.5 rounded-2xl shadow-md flex items-center gap-2.5">
          <ArrowUpDown className="w-4 h-4 text-cyan-300 animate-bounce" />
          <span className="text-xs font-bold text-indigo-100">
            동원체 분리: <span className="text-amber-300 text-sm font-black">{splitCount}</span> / 6 쌍
            <span className="mx-2 text-indigo-400">|</span>
            극 이동: <span className="text-cyan-300 text-sm font-black">{separatedCount}</span> / 12 개
          </span>
          <span className="text-[11px] text-cyan-200 hidden sm:inline font-semibold">
            (염색체 클릭 ➔ 동원체 분리 후 각각 위/아래로 드래그)
          </span>
        </div>

        <button
          onClick={handleAutoSeparate}
          className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-2 border-cyan-300 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Wand2 className="w-3.5 h-3.5 text-cyan-600" />
          <span>자동 전체 분리</span>
        </button>
      </div>

      {/* Main Split Stages (2 Daughter cells -> 4 Gamete cells) */}
      <div className="relative flex-1 grid grid-cols-2 gap-3 sm:gap-6 items-stretch">
        {[0, 1].map((cellIdx) => {
          const cellChromatids = chromatids.filter((c) => c.cellIndex === cellIdx);
          const isCellFullySplit = cellChromatids.length > 0 && cellChromatids.every((c) => c.pole !== undefined);
          const cellRef = cellIdx === 0 ? cell0Ref : cell1Ref;
          const activeItem = chromatids.find((c) => c.id === activeDraggingId);
          const isDraggingUpperHere = activeItem?.cellIndex === cellIdx && activeItem.targetPole === 'upper';
          const isDraggingLowerHere = activeItem?.cellIndex === cellIdx && activeItem.targetPole === 'lower';

          return (
            <div
              key={`cell-container-${cellIdx}`}
              ref={cellRef}
              className={`relative rounded-[28px] sm:rounded-[36px] border-4 border-dashed transition-all duration-500 p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-inner touch-none select-none ${
                isCellFullySplit
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-sky-300 bg-white/90'
              }`}
            >
              {/* Cell Header Badge */}
              <div className="flex items-center justify-between z-10 pointer-events-none">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full border shadow-xs ${
                    cellIdx === 0
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  딸세포 {cellIdx + 1} ({cellIdx === 0 ? '부계' : '모계'} n = 3)
                </span>
                <span className="text-[11px] font-bold text-indigo-900 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-100 shadow-xs">
                  {isCellFullySplit ? '2개 생식세포 형성 완료' : '중기 II → 후기 II (클릭 분리 ➔ 드래그)'}
                </span>
              </div>

              {/* Active Drag Drop Target Zone Highlights */}
              {isDraggingUpperHere && (
                <div className="absolute inset-x-3 top-10 h-28 border-2 border-dashed border-cyan-400 bg-cyan-100/40 rounded-2xl flex items-center justify-center pointer-events-none z-10 animate-pulse">
                  <span className="text-xs font-bold text-cyan-900 bg-white/90 px-3 py-1 rounded-full shadow-xs border border-cyan-300">
                    ⬆ 위쪽 극 (여기로 드래그하세요)
                  </span>
                </div>
              )}
              {isDraggingLowerHere && (
                <div className="absolute inset-x-3 bottom-10 h-28 border-2 border-dashed border-rose-400 bg-rose-100/40 rounded-2xl flex items-center justify-center pointer-events-none z-10 animate-pulse">
                  <span className="text-xs font-bold text-rose-900 bg-white/90 px-3 py-1 rounded-full shadow-xs border border-rose-300">
                    ⬇ 아래쪽 극 (여기로 드래그하세요)
                  </span>
                </div>
              )}

              {/* Cleavage line if split */}
              {isCellFullySplit && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-emerald-400 opacity-80 z-0 flex justify-center pointer-events-none">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full -mt-2.5 border border-emerald-300 shadow-xs">
                    세포질 분열 완료 (생식세포 2개 생성)
                  </span>
                </div>
              )}

              {/* Center Equatorial Plane Indicator (When not fully split) */}
              {!isCellFullySplit && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-12 border-y-2 border-dashed border-sky-300/80 bg-sky-50/40 rounded-xl pointer-events-none z-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-sky-700/70 bg-white/80 px-2.5 py-0.5 rounded-full">
                    적도판 (동원체 결합면)
                  </span>
                </div>
              )}

              {/* SVG Spindle Fibers Layer - Clean lines connecting seamlessly into centromeres */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {(() => {
                  const rect = cellRef.current?.getBoundingClientRect();
                  if (!rect) return null;
                  const w = rect.width;
                  const h = rect.height;
                  const upperPoleX = w * 0.5;
                  const upperPoleY = 24;
                  const lowerPoleX = w * 0.5;
                  const lowerPoleY = h - 24;
                  const centerY = h * 0.5;

                  return (
                    <g id={`spindle-cell-${cellIdx}`}>
                      {PAIR_SIZES.map((size) => {
                        const upper = cellChromatids.find(
                          (c) => c.pairId === size.id && c.targetPole === 'upper'
                        );
                        const lower = cellChromatids.find(
                          (c) => c.pairId === size.id && c.targetPole === 'lower'
                        );
                        if (!upper || !lower) return null;

                        const armW = Math.max(34, size.w * 1.15);
                        const chrArmH = Math.max(22, size.h * 0.5);

                        const isPairSplit = upper.isSplit && lower.isSplit;

                        if (!isPairSplit) {
                          // Unsplit: Both upper and lower spindle fibers connect to central shared centromere
                          const cx = upper.x + armW / 2;
                          const cy = centerY;

                          return (
                            <g key={`spindle-pair-${size.id}`}>
                              {/* Upper spindle fiber */}
                              <line
                                x1={upperPoleX}
                                y1={upperPoleY}
                                x2={cx}
                                y2={cy}
                                stroke="#94a3b8"
                                strokeWidth={2.2}
                                strokeDasharray="5,3.5"
                                strokeLinecap="round"
                                opacity={0.85}
                              />
                              {/* Lower spindle fiber */}
                              <line
                                x1={lowerPoleX}
                                y1={lowerPoleY}
                                x2={cx}
                                y2={cy}
                                stroke="#94a3b8"
                                strokeWidth={2.2}
                                strokeDasharray="5,3.5"
                                strokeLinecap="round"
                                opacity={0.85}
                              />
                            </g>
                          );
                        }

                        // Split: Upper spindle fiber meets upper chromatid apex (upper.y + 5)
                        const upperCentromereX = upper.x + armW / 2;
                        const upperCentromereY = upper.y + 5;
                        const isUpperDragging = activeDraggingId === upper.id;

                        // Lower spindle fiber meets lower chromatid apex (lower.y + chrArmH - 5)
                        const lowerCentromereX = lower.x + armW / 2;
                        const lowerCentromereY = lower.y + chrArmH - 5;
                        const isLowerDragging = activeDraggingId === lower.id;

                        return (
                          <g key={`spindle-pair-${size.id}`}>
                            {/* Upper spindle fiber */}
                            <line
                              x1={upperPoleX}
                              y1={upperPoleY}
                              x2={upperCentromereX}
                              y2={upperCentromereY}
                              stroke="#94a3b8"
                              strokeWidth={isUpperDragging ? 3.0 : 2.2}
                              strokeDasharray="5,3.5"
                              strokeLinecap="round"
                              opacity={isUpperDragging ? 1.0 : upper.pole ? 0.95 : 0.85}
                            />

                            {/* Lower spindle fiber */}
                            <line
                              x1={lowerPoleX}
                              y1={lowerPoleY}
                              x2={lowerCentromereX}
                              y2={lowerCentromereY}
                              stroke="#94a3b8"
                              strokeWidth={isLowerDragging ? 3.0 : 2.2}
                              strokeDasharray="5,3.5"
                              strokeLinecap="round"
                              opacity={isLowerDragging ? 1.0 : lower.pole ? 0.95 : 0.85}
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>

              {/* Draggable Chromatids / Chromosomes Layer */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                {PAIR_SIZES.map((size) => {
                  const upper = cellChromatids.find(
                    (c) => c.pairId === size.id && c.targetPole === 'upper'
                  );
                  const lower = cellChromatids.find(
                    (c) => c.pairId === size.id && c.targetPole === 'lower'
                  );
                  if (!upper || !lower) return null;

                  const armW = Math.max(34, size.w * 1.15);
                  const armH = Math.max(28, size.h * 0.65);
                  const chrArmH = Math.max(22, size.h * 0.5);

                  const isPairSplit = upper.isSplit && lower.isSplit;

                  // 1) BEFORE CLICK: Unified Horizontal X Chromosome on equatorial plate
                  if (!isPairSplit) {
                    const rect = cellRef.current?.getBoundingClientRect();
                    const cellH = rect?.height || 420;
                    const centerY = cellH * 0.5;

                    return (
                      <div
                        key={`unsplit-${upper.id}-${lower.id}`}
                        onClick={() => handleSplitChromosome(cellIdx as 0 | 1, size.id)}
                        style={{
                          position: 'absolute',
                          left: `${upper.x}px`,
                          top: `${centerY - armH / 2}px`,
                          width: `${armW}px`,
                          height: `${armH}px`,
                          touchAction: 'none',
                          zIndex: 35,
                          cursor: 'pointer',
                          pointerEvents: 'auto'
                        }}
                        className="group flex flex-col items-center justify-center select-none transition-transform hover:scale-105 active:scale-95"
                        title={`${size.name} 염색체 - 클릭하여 동원체를 분리하세요!`}
                      >
                        {/* Interactive Click-to-Split Badge */}
                        <span className="absolute -top-7 text-[10px] font-black text-amber-900 bg-amber-300 border-2 border-amber-400 px-2.5 py-0.5 rounded-full shadow-md animate-bounce whitespace-nowrap z-40">
                          👆 클릭하여 분리
                        </span>

                        <ChromosomeSVG
                          size={size}
                          origin={upper.origin}
                          type="horizontal-X"
                          scale={1}
                          showLabel={true}
                        />
                      </div>
                    );
                  }

                  // 2) AFTER CLICK: Separated Upper and Lower sister chromatids ready to be dragged to poles
                  const isUpperDragging = activeDraggingId === upper.id;
                  const isLowerDragging = activeDraggingId === lower.id;

                  return (
                    <React.Fragment key={`split-pair-${size.id}`}>
                      {/* Upper Chromatid */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, upper)}
                        style={{
                          position: 'absolute',
                          left: `${upper.x}px`,
                          top: `${upper.y}px`,
                          width: `${armW}px`,
                          height: `${chrArmH}px`,
                          touchAction: 'none',
                          cursor: upper.pole ? 'default' : isUpperDragging ? 'grabbing' : 'grab',
                          zIndex: isUpperDragging ? 50 : upper.pole ? 20 : 30,
                          filter: isUpperDragging ? 'drop-shadow(0 0 10px rgba(56,189,248,0.95))' : undefined,
                          pointerEvents: 'auto'
                        }}
                        className="group flex flex-col items-center justify-center select-none"
                        title={
                          upper.pole
                            ? `${size.name} 위쪽 염색체 (이동 완료)`
                            : `${size.name} 위쪽 염색분체 - 위로 드래그하세요`
                        }
                      >
                        {!upper.pole && (
                          <span className="absolute -top-6 text-[9px] font-black text-cyan-900 bg-cyan-200 border border-cyan-400 px-2 py-0.2 rounded-full shadow-xs whitespace-nowrap animate-pulse pointer-events-none">
                            위로 드래그 ⬆
                          </span>
                        )}

                        <ChromosomeSVG
                          size={size}
                          origin={upper.origin}
                          type="chromatid-upper"
                          scale={1}
                          showLabel={!upper.pole}
                        />
                      </div>

                      {/* Lower Chromatid */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, lower)}
                        style={{
                          position: 'absolute',
                          left: `${lower.x}px`,
                          top: `${lower.y}px`,
                          width: `${armW}px`,
                          height: `${chrArmH}px`,
                          touchAction: 'none',
                          cursor: lower.pole ? 'default' : isLowerDragging ? 'grabbing' : 'grab',
                          zIndex: isLowerDragging ? 50 : lower.pole ? 20 : 30,
                          filter: isLowerDragging ? 'drop-shadow(0 0 10px rgba(244,63,94,0.95))' : undefined,
                          pointerEvents: 'auto'
                        }}
                        className="group flex flex-col items-center justify-center select-none"
                        title={
                          lower.pole
                            ? `${size.name} 아래쪽 염색체 (이동 완료)`
                            : `${size.name} 아래쪽 염색분체 - 아래로 드래그하세요`
                        }
                      >
                        {!lower.pole && (
                          <span className="absolute -bottom-6 text-[9px] font-black text-rose-900 bg-rose-200 border border-rose-400 px-2 py-0.2 rounded-full shadow-xs whitespace-nowrap animate-pulse pointer-events-none">
                            아래로 드래그 ⬇
                          </span>
                        )}

                        <ChromosomeSVG
                          size={size}
                          origin={lower.origin}
                          type="chromatid-lower"
                          scale={1}
                          showLabel={!lower.pole}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {separatedCount === 12 && (
        <div className="mt-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-lg border-2 border-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <div className="font-bold text-sm">
                감수 2분열 완료! 최종 4개의 생식세포 딸세포 형성
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                각 생식세포 염색체 수: n = 3 (염색분체 3개)
              </div>
            </div>
          </div>
          <span className="text-xs bg-indigo-900 text-cyan-300 px-3 py-1.5 rounded-xl font-black shadow-xs">
            상단 [개념 퀴즈 ➔] 버튼 클릭
          </span>
        </div>
      )}
    </div>
  );
};
