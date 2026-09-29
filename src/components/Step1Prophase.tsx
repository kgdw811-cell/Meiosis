import React, { useState, useEffect, useRef } from 'react';
import { PAIR_SIZES } from '../data/chromosomes';
import { ChromosomeItem, OriginType } from '../types';
import { ChromosomeSVG } from './ChromosomeSVG';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, Wand2 } from 'lucide-react';

interface Step1ProphaseProps {
  onComplete: () => void;
  showToast: (msg: string) => void;
}

export const Step1Prophase: React.FC<Step1ProphaseProps> = ({ onComplete, showToast }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chromosomes, setChromosomes] = useState<ChromosomeItem[]>([]);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [pairedCount, setPairedCount] = useState(0);

  // Drag coordinates ref to avoid stale state
  const dragInfo = useRef<{
    id: string | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ id: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  // Initialize chromosomes placement
  const initPositions = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = Math.max(320, rect.width || window.innerWidth);
    const h = Math.max(500, rect.height || 540);

    const items: ChromosomeItem[] = [];
    const list: { pairId: number; origin: OriginType }[] = [];

    PAIR_SIZES.forEach((s) => {
      list.push({ pairId: s.id, origin: 'paternal' });
      list.push({ pairId: s.id, origin: 'maternal' });
    });

    // Shuffle
    list.sort(() => Math.random() - 0.5);

    list.forEach((data, idx) => {
      const sizeObj = PAIR_SIZES.find((p) => p.id === data.pairId)!;
      // Spread across middle cell circle
      const angle = (idx / list.length) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const radiusX = Math.min(w * 0.32, 260) * (0.45 + Math.random() * 0.45);
      const radiusY = Math.min(h * 0.32, 190) * (0.45 + Math.random() * 0.45);

      const cx = w / 2 - sizeObj.w / 2;
      const cy = h / 2 - sizeObj.h / 2;

      const posX = Math.max(20, Math.min(w - sizeObj.w - 20, cx + Math.cos(angle) * radiusX));
      const posY = Math.max(20, Math.min(h - sizeObj.h - 30, cy + Math.sin(angle) * radiusY));

      items.push({
        id: `chr-${data.pairId}-${data.origin}`,
        pairId: data.pairId,
        origin: data.origin,
        size: sizeObj,
        x: posX,
        y: posY,
        isPaired: false
      });
    });

    setChromosomes(items);
    setPairedCount(0);
  };

  useEffect(() => {
    initPositions();
    const handleResize = () => {
      // Re-center on major resize if not paired yet
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent, item: ChromosomeItem) => {
    if (item.isPaired) return;
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
    if (!dragInfo.current.id) return;
    const draggedId = dragInfo.current.id;
    dragInfo.current.id = null;
    setActiveDraggingId(null);

    // Snap Check
    checkPairing(draggedId);
  };

  const checkPairing = (draggedId: string) => {
    const dragged = chromosomes.find((c) => c.id === draggedId);
    if (!dragged || dragged.isPaired) return;

    // Find homologous partner
    const partner = chromosomes.find(
      (c) =>
        c.id !== dragged.id &&
        c.pairId === dragged.pairId &&
        c.origin !== dragged.origin &&
        !c.isPaired
    );

    if (!partner) return;

    const dist = Math.hypot(dragged.x - partner.x, dragged.y - partner.y);
    const snapThreshold = 115; // generous snap distance for great touch UX

    if (dist < snapThreshold) {
      // Snap together into a 2가 염색체!
      sound.playSnap();
      const midX = (dragged.x + partner.x) / 2;
      const midY = (dragged.y + partner.y) / 2;

      const patX = midX - dragged.size.w - 6;
      const matX = midX + 6;

      showToast(`🎉 ${dragged.pairId}번 상동염색체 접합 성공! 2가 염색체(4분체)가 형성되었습니다.`);

      const updated = chromosomes.map((c) => {
        if (c.pairId === dragged.pairId) {
          return {
            ...c,
            isPaired: true,
            x: c.origin === 'paternal' ? patX : matX,
            y: midY
          };
        }
        return c;
      });

      setChromosomes(updated);

      // Check total paired
      const newlyPairedCount = updated.filter((c) => c.isPaired).length / 2;
      setPairedCount(newlyPairedCount);

      if (newlyPairedCount === PAIR_SIZES.length) {
        sound.playSuccess();
        onComplete();
        showToast('🌟 모든 2가 염색체(3쌍)가 완성되었습니다! 상단의 [다음 단계]를 누르세요.');
      }
    }
  };

  // Auto-solve / hint for demonstration or stuck students
  const handleAutoPair = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 540;

    sound.playSuccess();
    const updated = chromosomes.map((c) => {
      const pairIndex = c.pairId - 1; // 0..2
      const targetY = h * 0.18 + pairIndex * (h * 0.28);
      const targetX = c.origin === 'paternal' ? w / 2 - c.size.w - 8 : w / 2 + 8;
      return {
        ...c,
        isPaired: true,
        x: targetX,
        y: targetY
      };
    });

    setChromosomes(updated);
    setPairedCount(PAIR_SIZES.length);
    onComplete();
    showToast('모든 상동염색체가 접합하여 2가 염색체 3쌍이 정렬되었습니다!');
  };

  return (
    <div className="relative w-full flex-1 flex flex-col p-2 sm:p-4 select-none touch-pan-y overflow-hidden">
      {/* 1. Top Control Bar: Status on Left, Auto-Pair on Top-Right */}
      <div className="w-full flex items-center justify-between gap-3 mb-2 px-2 z-20 shrink-0">
        <div className="bg-indigo-900 text-white border-2 border-indigo-700 px-4 py-2 rounded-2xl shadow-md flex items-center gap-3">
          <div className="flex -space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-indigo-900" title="부계" />
            <span className="w-4 h-4 rounded-full bg-rose-500 border-2 border-indigo-900" title="모계" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-indigo-100">
            접합된 2가 염색체:{' '}
            <span className="text-cyan-300 text-sm sm:text-base font-black">{pairedCount}</span> / {PAIR_SIZES.length} 쌍
          </span>
        </div>

        {/* Top-Right Action Button */}
        <button
          onClick={handleAutoPair}
          className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-2 border-cyan-300 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Wand2 className="w-4 h-4 text-cyan-600" />
          <span>자동 접합</span>
        </button>
      </div>

      {/* 2. Cell Model Area: Centered strictly underneath top bar with NO overlap */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full min-h-[500px] sm:min-h-[540px] flex items-center justify-center overflow-hidden touch-pan-y"
      >
        {/* Natural Biological Oval Cell Body Outline */}
        <div className="relative w-full max-w-4xl h-[480px] sm:h-[520px] border-4 border-dashed border-sky-300 rounded-[48%] bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/70 shadow-inner flex items-center justify-center pointer-events-none">
          {/* Equator & cell center guides */}
          <div className="w-0.5 h-[88%] border-l-2 border-dashed border-rose-300/70 absolute left-1/2 -translate-x-1/2" />
          
          {/* Cell Nucleus vanishing envelope border (핵막 소실 표현) */}
          <div className="w-[84%] h-[84%] border-2 border-dotted border-rose-300/80 rounded-[46%] flex items-center justify-center relative">
            <span className="absolute top-4 text-xs sm:text-sm font-black text-rose-600 bg-rose-50/95 px-3.5 py-1 rounded-full border border-rose-200 shadow-xs">
              핵막 소실 및 2가 염색체 형성 (전기 I)
            </span>
            <span className="text-indigo-900/10 text-6xl sm:text-8xl font-black uppercase tracking-widest pointer-events-none">
              2n = 6
            </span>
          </div>
        </div>

        {/* Chromosomes layer inside Cell Area */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {chromosomes.map((item) => {
            const isDragging = activeDraggingId === item.id;
            return (
              <div
                key={item.id}
                id={`chr-item-${item.id}`}
                onPointerDown={(e) => handlePointerDown(e, item)}
                style={{
                  position: 'absolute',
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: `${item.size.w}px`,
                  height: `${item.size.h}px`,
                  touchAction: 'none',
                  cursor: item.isPaired ? 'default' : isDragging ? 'grabbing' : 'grab',
                  zIndex: isDragging ? 50 : item.isPaired ? 20 : 10,
                  transform: isDragging ? 'scale(1.15)' : 'scale(1)',
                  transition: isDragging ? 'none' : 'transform 0.15s ease, filter 0.2s',
                  pointerEvents: 'auto'
                }}
                className="group flex items-center justify-center"
              >
                <ChromosomeSVG
                  size={item.size}
                  origin={item.origin}
                  type="X"
                  isPaired={item.isPaired}
                  highlight={isDragging}
                />
              </div>
            );
          })}
        </div>

        {/* Completion Overlay Banner inside Workspace */}
        {pairedCount === PAIR_SIZES.length && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl border-2 border-emerald-300 flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-emerald-100" />
            <div>
              <div className="font-bold text-sm">2가 염색체 3쌍 형성 완료!</div>
              <div className="text-xs text-emerald-100">상동염색체가 나란히 접합했습니다 (2n=6)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
