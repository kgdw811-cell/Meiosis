import React, { useState, useRef, useEffect } from 'react';
import { SimStep } from './types';
import { Header } from './components/Header';
import { Step1Prophase } from './components/Step1Prophase';
import { Step2Anaphase1 } from './components/Step2Anaphase1';
import { Step3Meiosis2 } from './components/Step3Meiosis2';
import { CompletionReport } from './components/CompletionReport';
import { QuizModal } from './components/QuizModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { sound } from './utils/audio';
import { STEP_INFOS } from './data/chromosomes';
import { Info } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<SimStep>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [quizStep, setQuizStep] = useState<2 | 3>(2);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  const [stepKey, setStepKey] = useState<number>(0);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef<SimStep>(currentStep);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearAutoAdvance();
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    showToast(next ? '🔊 효과음이 켜졌습니다.' : '🔇 효과음이 꺼졌습니다.');
  };

  const handleResetCurrentStep = () => {
    clearAutoAdvance();
    setStepKey((prev) => prev + 1);
    showToast('현재 단계를 초기화했습니다.');
  };

  const transitionToStep = (nextStep: SimStep, toastMsg?: string) => {
    clearAutoAdvance();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setStepKey((prev) => prev + 1);
      setIsTransitioning(false);
      if (toastMsg) showToast(toastMsg);
    }, 240);
  };

  const handleStepComplete = () => {
    clearAutoAdvance();
    const step = currentStepRef.current;
    if (step === 1) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        transitionToStep(2, '💡 1단계 완료! 감수 1분열(상동 분리) 단계로 진행합니다.');
      }, 1700);
    } else if (step === 2) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        setQuizStep(2);
        setIsQuizOpen(true);
      }, 1700);
    } else if (step === 3) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        setQuizStep(3);
        setIsQuizOpen(true);
      }, 1700);
    }
  };

  const handleQuizPass = () => {
    clearAutoAdvance();
    setIsQuizOpen(false);
    if (quizStep === 2) {
      transitionToStep(3, '💡 1분열 퀴즈 통과! 감수 2분열(염색분체 분리) 단계로 진행합니다.');
    } else {
      transitionToStep(4, '💡 2분열 퀴즈 통과! 최종 감수분열 탐구 결과 리포트로 이동합니다.');
    }
  };

  const handleSelectStep = (step: SimStep) => {
    if (step === currentStep && !isTransitioning) return;
    transitionToStep(step);
  };

  const stepInfo = STEP_INFOS[currentStep];

  return (
    <div className="flex flex-col min-h-screen w-full bg-sky-50 overflow-x-hidden font-sans text-slate-800 antialiased select-none">
      {/* Top Header */}
      <Header
        currentStep={currentStep}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onReset={handleResetCurrentStep}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSelectStep={handleSelectStep}
      />

      {/* Instruction Banner Bar - Vibrant Cyan Theme */}
      <div
        id="instruction-bar"
        className="bg-cyan-100 border-b-4 border-cyan-200 py-2.5 sm:py-3 px-4 sm:px-6 text-center shadow-inner flex items-center justify-center gap-2 sm:gap-3 shrink-0"
      >
        <span className="bg-cyan-500 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg font-black text-xs sm:text-sm tracking-wide shadow-xs shrink-0">
          STEP 0{currentStep}
        </span>
        <span className="text-xs sm:text-base font-bold text-cyan-900 tracking-tight leading-snug">
          {stepInfo.instructions}
        </span>
      </div>

      {/* Main Interactive Workspace Area optimized for 16:10 tablet viewport */}
      <main className="flex-1 relative bg-white my-2 sm:my-3 mx-2 sm:mx-auto rounded-[24px] sm:rounded-[36px] border-4 sm:border-6 border-sky-100 shadow-xl overflow-hidden flex flex-col min-h-[600px] sm:min-h-[640px] max-w-6xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)]">
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-[0.985] blur-[1px]' : 'opacity-100 scale-100 blur-0'
          }`}
        >
          {currentStep === 1 && (
            <Step1Prophase
              key={`step1-${stepKey}`}
              onComplete={handleStepComplete}
              showToast={showToast}
            />
          )}
          {currentStep === 2 && (
            <Step2Anaphase1
              key={`step2-${stepKey}`}
              onComplete={handleStepComplete}
              showToast={showToast}
            />
          )}
          {currentStep === 3 && (
            <Step3Meiosis2
              key={`step3-${stepKey}`}
              onComplete={handleStepComplete}
              showToast={showToast}
            />
          )}
          {currentStep === 4 && (
            <CompletionReport
              key={`step4-${stepKey}`}
              onRestart={() => handleSelectStep(1)}
              onSelectStep={handleSelectStep}
            />
          )}
        </div>

        {/* Global Toast Notification - Vibrant Floating Pill */}
        {toast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-6 sm:px-8 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm font-semibold tracking-tight">{toast}</p>
          </div>
        )}
      </main>

      {/* Footer Legend Bar */}
      <footer className="px-4 sm:px-8 py-2.5 bg-white border-t border-slate-200/80 flex flex-wrap justify-between items-center text-slate-500 text-xs sm:text-sm font-semibold shadow-xs">
        <div className="flex items-center gap-2">
          <span>시뮬레이션:</span>
          <span className="text-indigo-600 font-extrabold">{stepInfo.statusBadge}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-500 rounded-xs shadow-xs" />
            <span>부계 염색체 (파랑)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-rose-500 rounded-xs shadow-xs" />
            <span>모계 염색체 (빨강)</span>
          </span>
        </div>
      </footer>

      {/* Concept Quiz Modal */}
      <QuizModal isOpen={isQuizOpen} step={quizStep} onPass={handleQuizPass} />

      {/* Biology Concept Guide Modal */}
      <HelpGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
