import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { sound } from '../utils/audio';
import { CheckCircle, XCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  step: 2 | 3;
  onPass: () => void;
}

const QUIZ_BY_STEP: Record<2 | 3, QuizQuestion> = {
  2: {
    id: 1,
    stageName: '감수 1분열 핵심 개념 (2단계 완료)',
    question:
      '상동염색체가 접합한 2가 염색체가 분리되어 2개의 딸세포로 나뉘었습니다. 감수 1분열 직후 각 딸세포의 염색체 수(상태)는 어떻게 변할까요?',
    options: [
      '2n = 6 개 (염색체 수 변화 없음)',
      'n = 3 개 (상동염색체가 분리되어 염색체 수가 절반으로 줄어듦)',
      'n = 1.5 개 (염색체가 부서짐)'
    ],
    correctIndex: 1,
    explanation:
      '정답입니다! 감수 1분열에서는 쌍을 이루던 상동염색체(2n=6)가 서로 다른 딸세포로 분리되므로, 세포당 염색체 수가 2n=6에서 n=3으로 반감됩니다.'
  },
  3: {
    id: 2,
    stageName: '감수 2분열 및 DNA 변화 (3단계 완료)',
    question:
      '감수 2분열의 특징과 최종 결과로 가장 옳은 설명은 무엇일까요?',
    options: [
      '간기에 DNA를 한 번 더 복제한 후 분열한다.',
      '염색체 수는 n=3으로 일정하고, DNA의 양은 절반으로 줄어든다.',
      '염색체 수가 n=3에서 n=1.5로 한 번 더 줄어든다.'
    ],
    correctIndex: 1,
    explanation:
      '정답입니다! 감수 2분열에서는 자매염색분체가 분리되므로 염색체 수는 n=3으로 일정하게 유지되고, 세포 1개당 DNA의 양은 절반으로 줄어듭니다.'
  }
};

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, step, onPass }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const currentQ = QUIZ_BY_STEP[step];

  const handleSelect = (index: number) => {
    if (isAnswered && isCorrect) return;

    setSelectedOption(index);
    const correct = index === currentQ.correctIndex;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playSuccess();
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-indigo-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-indigo-800">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="font-extrabold text-sm sm:text-base text-cyan-300">
              {step === 2 ? '1분열 완료 개념 퀴즈' : '2분열 완료 개념 퀴즈'}
            </span>
          </div>
          <span className="text-xs bg-indigo-800 text-cyan-200 border border-indigo-700 px-3 py-1 rounded-full font-bold">
            {currentQ.stageName}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-sky-50 hover:border-sky-300';

              if (isAnswered) {
                if (i === currentQ.correctIndex) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-800 font-medium line-through';
                }
              }

              return (
                <button
                  key={i}
                  id={`quiz-opt-${i}`}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback section */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                isCorrect
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="text-xs sm:text-sm space-y-1">
                <div className="font-bold">
                  {isCorrect ? '정답입니다! 🎉' : '다시 한 번 생각해보세요! 🤔'}
                </div>
                <div className="text-slate-600 leading-relaxed">
                  {isCorrect
                    ? currentQ.explanation
                    : step === 2
                    ? '감수 1분열에서는 상동염색체가 분리되어 서로 다른 세포로 들어간다는 점(2n ➔ n)을 떠올려보세요.'
                    : '감수 2분열에서는 자매염색분체가 분리되므로 염색체 수는 유지되고 DNA량만 반감된다는 점을 떠올려보세요.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          {isCorrect && (
            <button
              id="quiz-continue-btn"
              onClick={onPass}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs sm:text-sm font-black shadow-[0_4px_0_0_#059669] active:shadow-none active:translate-y-1 flex items-center gap-2 cursor-pointer transition-all border-2 border-emerald-400"
            >
              <span>{step === 2 ? '감수 2분열 시작하기 ➔' : '최종 결과 리포트 확인하기 ➔'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
