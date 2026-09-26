import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, BookOpenCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { PAIR_SIZES } from '../data/chromosomes';
import { ChromosomeSVG } from './ChromosomeSVG';
import { sound } from '../utils/audio';

interface CompletionReportProps {
  onRestart: () => void;
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
}

export const CompletionReport: React.FC<CompletionReportProps> = ({ onRestart, onSelectStep }) => {
  useEffect(() => {
    sound.playSuccess();
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-7 bg-slate-100/90 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6 pb-12">

        {/* Section 1: 최종 형성된 4개의 생식세포 (2줄로 크고 시원하게 배치) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-3 border-sky-300 relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-indigo-50/40">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-sky-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                4
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    최종 형성된 4개의 생식세포
                  </h2>
                  <span className="bg-sky-100 text-sky-800 text-xs sm:text-sm font-extrabold px-3 py-0.5 rounded-full border border-sky-300">
                    각각 n = 3
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  1개의 모세포(2n=6)가 감수 1분열과 2분열을 거쳐 서로 다른 유전 구성을 지닌 4개의 딸세포로 완성되었습니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>염색체 수 반감 (2n=6 ➔ n=3)</span>
              </span>
            </div>
          </div>

          {/* 4 Cells Grid: 2 rows of 2 cards (두 줄로 표시) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-5">
            {[
              {
                cellNum: 1,
                title: '생식세포 ①',
                badge: '제1분열 계열',
                origin: 'paternal' as const,
                accentColor: 'border-blue-300 bg-blue-50/50',
                headerBg: 'bg-blue-600 text-white',
                desc: '상동염색체 중 1세트(3개) 분리'
              },
              {
                cellNum: 2,
                title: '생식세포 ②',
                badge: '제1분열 계열',
                origin: 'paternal' as const,
                accentColor: 'border-blue-300 bg-blue-50/50',
                headerBg: 'bg-blue-500 text-white',
                desc: '자매염색분체 분리로 복제본 동일 분배'
              },
              {
                cellNum: 3,
                title: '생식세포 ③',
                badge: '제1분열 계열',
                origin: 'maternal' as const,
                accentColor: 'border-rose-300 bg-rose-50/50',
                headerBg: 'bg-rose-600 text-white',
                desc: '상동염색체 중 1세트(3개) 분리'
              },
              {
                cellNum: 4,
                title: '생식세포 ④',
                badge: '제1분열 계열',
                origin: 'maternal' as const,
                accentColor: 'border-rose-300 bg-rose-50/50',
                headerBg: 'bg-rose-500 text-white',
                desc: '자매염색분체 분리로 복제본 동일 분배'
              }
            ].map((cell) => (
              <div
                key={cell.cellNum}
                className={`rounded-2xl border-2 ${cell.accentColor} p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shadow-xs ${cell.headerBg}`}>
                      {cell.title}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-800">
                      n = 3
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200">
                    DNA 상대량: <strong className="text-indigo-600 text-sm">1</strong>
                  </span>
                </div>

                {/* Enlarged Chromosomes Display Area (1번~3번 3개 염색체 확대 표시) */}
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-inner flex items-center justify-around gap-2 min-h-[140px] sm:min-h-[155px]">
                  {PAIR_SIZES.map((size) => (
                    <div key={`cell-${cell.cellNum}-${size.id}`} className="flex flex-col items-center justify-end h-full">
                      <div className="flex items-center justify-center min-h-[90px] sm:min-h-[105px]">
                        <ChromosomeSVG
                          size={size}
                          origin={cell.origin}
                          type="I"
                          scale={1.05}
                          showLabel={false}
                        />
                      </div>
                      <span className={`mt-2 text-xs sm:text-sm font-black px-2 py-0.5 rounded-md border ${
                        cell.origin === 'paternal'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                        {size.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cell Footer Description */}
                <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium px-1">
                  <span>{cell.desc}</span>
                  <span className="font-bold text-sky-700">단일 염색분체 3개 구성</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: 핵심 비교 및 단계별 변화 (글자 크기 확대 & 줄바꿈 최적화) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Comparison Table (체세포 분열 vs 감수분열 비교) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-lg border-2 border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <BookOpenCheck className="w-5 h-5 text-sky-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  체세포 분열 vs 생식세포 분열(감수분열) 비교
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300">
                      <th className="py-2.5 px-3 font-extrabold whitespace-nowrap">비교 기준</th>
                      <th className="py-2.5 px-3 font-extrabold text-slate-700 whitespace-nowrap">체세포 분열</th>
                      <th className="py-2.5 px-3 font-black text-sky-800 bg-sky-100/70 whitespace-nowrap">감수분열 (생식세포)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50 whitespace-nowrap">분열 횟수</td>
                      <td className="py-3 px-3 font-semibold">1회 분열</td>
                      <td className="py-3 px-3 font-extrabold text-sky-700 bg-sky-50/60 whitespace-nowrap">연속 2회 분열</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50 whitespace-nowrap">형성된 딸세포 수</td>
                      <td className="py-3 px-3 font-semibold">2개</td>
                      <td className="py-3 px-3 font-extrabold text-sky-700 bg-sky-50/60 whitespace-nowrap">4개</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50 whitespace-nowrap">2가 염색체 접합</td>
                      <td className="py-3 px-3 font-semibold text-rose-600 whitespace-nowrap">형성되지 않음</td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700 bg-sky-50/60 whitespace-nowrap">전기 I에서 형성!</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50 whitespace-nowrap">염색체 수 변화</td>
                      <td className="py-3 px-3 font-semibold whitespace-nowrap">2n ➔ 2n (그대로 유지)</td>
                      <td className="py-3 px-3 font-black text-rose-600 bg-sky-50/60 whitespace-nowrap">2n ➔ n (2n=6 ➔ n=3 반감★)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50 whitespace-nowrap">분열의 주요 의의</td>
                      <td className="py-3 px-3 font-semibold">생장, 재생, 조직 보수</td>
                      <td className="py-3 px-3 font-bold text-sky-800 bg-sky-50/60 leading-snug">세대를 거쳐도 염색체 수 일정 유지</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-950 font-medium">
              📌 <strong>핵심 요약:</strong> 감수분열은 생식세포를 만들기 위해 연속 2회 분열하여 염색체 수를 반감시킵니다.
            </div>
          </div>

          {/* 2. Step-by-step Chromosome & DNA Changes (단계별 염색체 수 & DNA 상대량 변화) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-lg border-2 border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  단계별 염색체 수 & DNA 상대량 변화
                </h3>
              </div>

              <div className="space-y-3">
                {/* Stage 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                      <span>모세포 (간기 DNA 복제 완료)</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 ml-6">
                      DNA 복제로 각 염색체당 2개의 자매염색분체 형성
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-sky-700">2n = 6</div>
                    <div className="text-xs sm:text-sm font-extrabold text-indigo-600">DNA 상대량: 4</div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-3.5 rounded-2xl bg-sky-50/80 border-2 border-sky-300 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-sky-950 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                      <span>감수 1분열 완료 (상동염색체 분리)</span>
                    </div>
                    <div className="text-xs text-sky-800 mt-0.5 ml-6">
                      상동염색체가 양극으로 분리되어 딸세포 2개 형성
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-rose-600">n = 3 (반감★)</div>
                    <div className="text-xs sm:text-sm font-extrabold text-indigo-600">DNA 상대량: 2</div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                      <span>감수 2분열 완료 (자매염색분체 분리)</span>
                    </div>
                    <div className="text-xs text-emerald-800 mt-0.5 ml-6">
                      동원체 분리로 염색분체가 분리되어 최종 4개 세포 형성
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-emerald-700">n = 3 (유지)</div>
                    <div className="text-xs sm:text-sm font-extrabold text-indigo-600">DNA 상대량: 1 (반감★)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Biology Concept Banner */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm text-amber-950 leading-relaxed font-semibold">
              💡 <strong>핵심 시험 포인트:</strong><br />
              • <strong>감수 1분열:</strong> 상동염색체 분리 ➔ <strong>염색체 수 반감</strong> (2n=6 ➔ n=3)<br />
              • <strong>감수 2분열:</strong> 자매염색분체 분리 ➔ 염색체 수 유지(n=3), <strong>DNA 양만 반감</strong> (2 ➔ 1)
            </div>
          </div>
        </div>

        {/* Section 3: 하단 액션 버튼 (오직 실습 다시하기 버튼만 크고 명확하게 배치) */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onRestart}
            className="px-8 py-3.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-cyan-300 hover:text-cyan-200 font-black text-base shadow-[0_5px_0_0_#1e1b4b] active:shadow-none active:translate-y-1 flex items-center gap-2.5 cursor-pointer transition-all border-2 border-indigo-700"
          >
            <RotateCcw className="w-5 h-5 text-cyan-300" />
            <span>처음부터 다시 실습하기</span>
          </button>
        </div>

      </div>
    </div>
  );
};
