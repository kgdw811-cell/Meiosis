import React from 'react';
import { X, BookOpen, CheckCircle, Info } from 'lucide-react';
import { ChromosomeSVG } from './ChromosomeSVG';
import { PAIR_SIZES } from '../data/chromosomes';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-indigo-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-300" />
            <h3 className="font-extrabold text-base sm:text-lg text-cyan-300">
              중3 과학 생식과 발생: 핵심 개념 가이드
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          {/* Term 1: 상동염색체 & 2가 염색체 */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>상동염색체와 2가 염색체(4분체)란?</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              <strong>상동염색체:</strong> 체세포에서 모양과 크기가 같은 염색체 쌍으로, 하나는 아버지(부계, 파란색), 하나는 어머니(모계, 빨간색)로부터 물려받았습니다.<br />
              <strong>2가 염색체:</strong> 감수 1분열 전기에서 복제된 상동염색체 2개가 서로 나란히 접합하여 형성된 4개의 염색분체 구조입니다. (오직 감수 1분열에서만 관찰됨!)
            </p>
            <div className="flex items-center justify-center gap-6 pt-2 bg-white p-3 rounded-xl border border-sky-100">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-600 mb-1">상동염색체 쌍</span>
                <div className="flex gap-2">
                  <ChromosomeSVG size={PAIR_SIZES[2]} origin="paternal" type="X" scale={0.8} />
                  <ChromosomeSVG size={PAIR_SIZES[2]} origin="maternal" type="X" scale={0.8} />
                </div>
              </div>
              <div className="text-xl text-sky-500 font-bold">➔ 접합 ➔</div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-sky-800 mb-1">2가 염색체</span>
                <div className="flex gap-1 p-1 bg-sky-100/70 rounded-xl border border-sky-300">
                  <ChromosomeSVG size={PAIR_SIZES[2]} origin="paternal" type="X" isPaired={true} scale={0.8} />
                  <ChromosomeSVG size={PAIR_SIZES[2]} origin="maternal" type="X" isPaired={true} scale={0.8} />
                </div>
              </div>
            </div>
          </div>

          {/* Term 2: 감수 1분열 vs 감수 2분열 */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>감수 1분열과 감수 2분열의 차이</span>
            </div>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li className="leading-relaxed">
                <strong>감수 1분열:</strong> <strong>상동염색체</strong>가 분리되어 염색체 수가 <strong>2n = 6 ➔ n = 3</strong>으로 <strong>반감</strong>됩니다.
              </li>
              <li className="leading-relaxed">
                <strong>감수 2분열:</strong> 간기 없이 바로 시작되며, <strong>자매염색분체</strong>가 분리되어 염색체 수는 <strong>n = 3 ➔ n = 3</strong>으로 유지되고 DNA 상대량만 절반으로 줄어듭니다.
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>실습 꿀팁:</strong> 터치 스크린 또는 마우스로 염색체를 원하는 위치로 드래그하면 자석처럼 결합하거나 분리됩니다.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
