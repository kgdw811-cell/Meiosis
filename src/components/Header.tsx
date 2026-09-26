import React from 'react';
import { Volume2, VolumeX, RotateCcw, ArrowRight, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { User } from 'firebase/auth';
import { SimStep } from '../types';
import { STEP_INFOS } from '../data/chromosomes';

interface HeaderProps {
  currentStep: SimStep;
  soundEnabled: boolean;
  canNext: boolean;
  user?: User | null;
  onToggleSound: () => void;
  onReset: () => void;
  onNext: () => void;
  onOpenGuide: () => void;
  onOpenDrive?: () => void;
  onSelectStep: (step: SimStep) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  soundEnabled,
  canNext,
  user,
  onToggleSound,
  onReset,
  onNext,
  onOpenGuide,
  onOpenDrive,
  onSelectStep
}) => {
  const stepInfo = STEP_INFOS[currentStep];

  return (
    <header className="bg-indigo-900 text-white border-b-2 border-indigo-800 shadow-lg select-none">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-6">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-md font-black text-white text-lg tracking-wider">
            2n
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-cyan-300">
                감수분열 직접 진행해보기
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-bold text-cyan-200 bg-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-700">
                중3 생식과 유전
              </span>
            </div>
            <p className="text-xs font-semibold text-indigo-200 tracking-wide">
              생식세포 분열 탐구 시뮬레이션 (2n = 6 ➔ n = 3)
            </p>
          </div>
        </div>

        {/* Dynamic Status Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-800 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-2 border-indigo-700 shadow-inner flex items-center">
            <span className="text-cyan-400 font-bold text-xs sm:text-sm">상태:</span>
            <span className="ml-2 font-mono text-sm sm:text-base font-extrabold text-white tracking-wide">
              {stepInfo.statusBadge}
            </span>
          </div>
          <div className="hidden lg:flex bg-indigo-950/80 border border-indigo-700/80 text-cyan-200 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
            {stepInfo.dnaBadge}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="guide-btn"
            onClick={onOpenGuide}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-800/90 hover:bg-indigo-700 text-indigo-100 hover:text-white transition-all border border-indigo-600/80 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="학습 개념 도우미"
            aria-label="학습 개념 도우미"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">개념 정리</span>
          </button>

          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-xl bg-indigo-800/90 hover:bg-indigo-700 text-indigo-100 hover:text-white transition-all border border-indigo-600/80 cursor-pointer"
            title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            aria-label="효과음 토글"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            id="reset-btn"
            onClick={onReset}
            className="bg-slate-700 hover:bg-slate-600 px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all text-white text-xs sm:text-sm active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="현재 단계 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span>다시하기</span>
          </button>

          <button
            id="next-step-btn"
            disabled={!canNext && currentStep !== 4}
            onClick={onNext}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all text-white ${
              canNext || currentStep === 4
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_0_0_#059669] active:shadow-none active:translate-y-1 cursor-pointer'
                : 'bg-slate-700/60 text-slate-400 border border-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <span>
              {currentStep === 1
                ? '다음 단계 ➔'
                : currentStep === 2
                ? '개념 퀴즈 ➔'
                : currentStep === 3
                ? '개념 퀴즈 ➔'
                : '처음부터 다시'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Tabs / Progress Line */}
      <div className="bg-indigo-950/90 px-4 sm:px-8 py-2 border-t border-indigo-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2">
          {[
            { step: 1, label: '1단계: 전기 I (2가 염색체)' },
            { step: 2, label: '2단계: 중기~후기 I (상동 분리)' },
            { step: 3, label: '3단계: 감수 2분열 (염색분체 분리)' },
            { step: 4, label: '4단계: 결과 분석 & 인증' }
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isPassed = currentStep > item.step;
            return (
              <button
                key={item.step}
                onClick={() => onSelectStep(item.step as SimStep)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-400 text-indigo-950 font-black shadow-md'
                    : isPassed
                    ? 'text-emerald-300 hover:bg-indigo-800/80 font-bold'
                    : 'text-indigo-300/70 hover:text-white'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive
                      ? 'bg-indigo-950 text-cyan-400'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-800 text-indigo-300'
                  }`}
                >
                  {isPassed ? '✓' : item.step}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
