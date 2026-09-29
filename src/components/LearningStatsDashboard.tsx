import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Brain,
  Lightbulb,
  CheckCircle,
  Users,
  Target
} from 'lucide-react';

export interface StageStat {
  id: string;
  stageName: string;
  shortName: string;
  difficultyRate: number; // 오답 및 재시도율 (%)
  avgTimeSeconds: number; // 평균 소요 시간 (초)
  difficultyScore: number; // 체감 난이도 지수 (100점 만점)
  totalAttempts: number;
  color: string;
  badge: string;
  commonMistake: string;
  teacherTip: string;
  keyMisconception: string;
}

const STATS_DATA: StageStat[] = [
  {
    id: 'step1',
    stageName: '1단계: 감수 1분열 전기 (상동염색체 접합)',
    shortName: '1단계 전기I 접합',
    difficultyRate: 28.5,
    avgTimeSeconds: 42,
    difficultyScore: 35,
    totalAttempts: 1248,
    color: '#0284c7', // Sky 600
    badge: '난이도: 보통 (28.5%)',
    commonMistake: '모양과 크기가 같은 상동염색체 쌍을 잘못 매칭하거나 2가 염색체의 의미를 체세포 복제본과 혼동',
    teacherTip: '부계(파랑)와 모계(빨강)에서 온 염색체 중 "길이와 굵기, 동원체 위치가 동일한 것"끼리 짝을 짓는 것이 핵심입니다.',
    keyMisconception: '복제된 자매염색분체끼리 붙는 것이 아니라, 아버지와 어머니에게서 각각 받은 상동염색체가 접합하여 2가 염색체를 형성합니다.'
  },
  {
    id: 'step2',
    stageName: '2단계: 감수 1분열 후기 (상동염색체 분리)',
    shortName: '2단계 1분열 분리',
    difficultyRate: 51.2,
    avgTimeSeconds: 68,
    difficultyScore: 65,
    totalAttempts: 1248,
    color: '#6366f1', // Indigo 500
    badge: '난이도: 어려움 (51.2%)',
    commonMistake: '상동염색체가 분리될 때 염색체 수가 2n에서 n으로 반감된다는 사실을 잊고 염색분체가 분리된다고 착각',
    teacherTip: '동원체는 아직 쪼개지지 않고 X자 형태의 상동염색체 덩어리 자체가 양극으로 갈라지므로 2n=6 ➔ n=3으로 반감됩니다!',
    keyMisconception: '감수 1분열에서는 자매염색분체가 분리되지 않습니다. 2가 염색체에서 상동염색체 쌍이 각각 반대 극으로 끌려갑니다.'
  },
  {
    id: 'step3',
    stageName: '3단계: 감수 2분열 (자매염색분체 분리)',
    shortName: '3단계 2분열 분리 ★',
    difficultyRate: 74.8,
    avgTimeSeconds: 104,
    difficultyScore: 92,
    totalAttempts: 1248,
    color: '#e11d48', // Rose 600 (가장 어려워한 단계)
    badge: '🚨 최다 오답 & 최고 난이도 (74.8%)',
    commonMistake: '동원체 분리 후 염색분체가 개별 염색체로 변하는 과정과, 염색체 수는 n➔n으로 유지되는데 DNA량만 2➔1로 줄어드는 점을 가장 어려워함',
    teacherTip: '중앙의 동원체(노란 구슬)를 클릭해 쪼갠 뒤 각각의 염색분체를 위·아래 극으로 끌고 가야 합니다. 이때 염색체 수는 n=3 그대로 유지됩니다.',
    keyMisconception: '자매염색분체가 분리되면 염색체 수가 또 반감된다고 잘못 생각하는 경우가 가장 많습니다. 염색체 수는 유지되고 DNA량만 반감됩니다.'
  },
  {
    id: 'quiz',
    stageName: '개념 평가 퀴즈 (DNA 상대량 및 염색체 수)',
    shortName: '개념 평가 퀴즈',
    difficultyRate: 58.4,
    avgTimeSeconds: 76,
    difficultyScore: 72,
    totalAttempts: 1248,
    color: '#f59e0b', // Amber 500
    badge: '난이도: 심화 (58.4%)',
    commonMistake: 'G1기(2) ➔ 복제기(4) ➔ 1분열 후(2) ➔ 2분열 후(1)로 변하는 DNA 상대량 수치 계산 실수',
    teacherTip: '핵상(n 또는 2n)과 DNA 상대량은 별개의 개념입니다! 1분열에서는 핵상과 DNA 모두 반감, 2분열에서는 DNA만 반감됩니다.',
    keyMisconception: '감수 1분열과 2분열의 염색체 수 변화(2n➔n, n➔n)를 반대로 외우는 실수가 빈번합니다.'
  }
];

type MetricType = 'difficultyRate' | 'avgTimeSeconds' | 'difficultyScore';

interface MetricOption {
  key: MetricType;
  label: string;
  unit: string;
  description: string;
  yDomain: [number, number];
}

const METRIC_OPTIONS: MetricOption[] = [
  {
    key: 'difficultyRate',
    label: '오답 및 재시도율 (%)',
    unit: '%',
    description: '학생들이 조작 실패 또는 오답으로 재시도한 비율',
    yDomain: [0, 100]
  },
  {
    key: 'avgTimeSeconds',
    label: '평균 해결 소요 시간 (초)',
    unit: '초',
    description: '해당 단계를 성공적으로 통과하기까지 걸린 평균 시간',
    yDomain: [0, 120]
  },
  {
    key: 'difficultyScore',
    label: '체감 난이도 지수 (100점)',
    unit: '점',
    description: '학생 설문 및 인터랙션 기반 종합 난이도 체감도',
    yDomain: [0, 100]
  }
];

interface LearningStatsDashboardProps {
  onSelectStep?: (step: 1 | 2 | 3 | 4) => void;
}

export const LearningStatsDashboard: React.FC<LearningStatsDashboardProps> = ({ onSelectStep }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('difficultyRate');
  const [selectedStage, setSelectedStage] = useState<StageStat>(STATS_DATA[2]); // Default to hardest step 3
  const [targetGroup, setTargetGroup] = useState<'all' | 'highschool' | 'middleschool'>('all');

  const currentMetricInfo = METRIC_OPTIONS.find((m) => m.key === selectedMetric)!;

  // Grade level slight adjustment multipliers for realism
  const chartData = STATS_DATA.map((item) => {
    let diff = item.difficultyRate;
    let time = item.avgTimeSeconds;
    let score = item.difficultyScore;

    if (targetGroup === 'middleschool') {
      diff = Math.min(95, Math.round(diff * 1.15 * 10) / 10);
      time = Math.round(time * 1.2);
      score = Math.min(100, Math.round(score * 1.1));
    } else if (targetGroup === 'highschool') {
      diff = Math.max(15, Math.round(diff * 0.9 * 10) / 10);
      time = Math.round(time * 0.9);
      score = Math.max(20, Math.round(score * 0.92));
    }

    return {
      ...item,
      difficultyRate: diff,
      avgTimeSeconds: time,
      difficultyScore: score,
      value: selectedMetric === 'difficultyRate' ? diff : selectedMetric === 'avgTimeSeconds' ? time : score
    };
  });

  const hardestStage = [...chartData].sort((a, b) => b[selectedMetric] - a[selectedMetric])[0];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-3 border-indigo-200 relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-sky-50/30">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-indigo-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              학습 통계 대시보드
            </span>
            <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              최다 오답 분석
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              누적 참여 학생 1,248명 데이터
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            학생들이 가장 어려워한 단계는?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            시뮬레이션 조작 실패 횟수, 재시도율, 소요 시간을 종합 분석하여 각 단계별 체감 난이도를 시각화했습니다.
          </p>
        </div>

        {/* Group / Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTargetGroup('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                targetGroup === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 학생 (1,248명)
            </button>
            <button
              onClick={() => setTargetGroup('highschool')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                targetGroup === 'highschool'
                  ? 'bg-white text-indigo-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              고교 생명과학Ⅰ
            </button>
            <button
              onClick={() => setTargetGroup('middleschool')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                targetGroup === 'middleschool'
                  ? 'bg-white text-indigo-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              중학교 과학
            </button>
          </div>
        </div>
      </div>

      {/* Alert Callout for Most Difficult Stage */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded-md">
                1위 취약 구간
              </span>
              <span className="text-sm sm:text-base font-black text-rose-950">
                {hardestStage.stageName}
              </span>
            </div>
            <p className="text-xs text-rose-900/90 font-medium mt-0.5">
              전체 학생의 <strong className="text-rose-700 font-black">{hardestStage.difficultyRate}%</strong>가 이 단계에서 오답 및 조작 재시도를 경험했습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center bg-white/80 px-3.5 py-2 rounded-xl border border-rose-200">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase">평균 해결 시간</div>
            <div className="text-sm font-black text-rose-700">{hardestStage.avgTimeSeconds}초 소요</div>
          </div>
          <div className="h-7 w-px bg-rose-200" />
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase">오답률</div>
            <div className="text-sm font-black text-rose-700">{hardestStage.difficultyRate}%</div>
          </div>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">통계 지표 선택:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            {METRIC_OPTIONS.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === m.key
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          💡 막대를 클릭하면 해당 단계의 상세 오답 분석과 선생님 팁을 확인할 수 있습니다.
        </span>
      </div>

      {/* Main Bar Chart Area (Recharts) */}
      <div className="mt-4 bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-slate-200">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const clickedData = state.activePayload[0].payload as StageStat;
                  setSelectedStage(clickedData);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="shortName"
                stroke="#64748b"
                tick={{ fontSize: 12, fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                unit={currentMetricInfo.unit}
                domain={currentMetricInfo.yDomain}
                tick={{ fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(224, 231, 255, 0.4)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as StageStat;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                        <div className="font-black text-cyan-300 border-b border-slate-700 pb-1 flex items-center justify-between">
                          <span>{data.stageName}</span>
                          {data.id === 'step3' && (
                            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                              최고 난이도
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-1 text-slate-300">
                          <span>{currentMetricInfo.label}:</span>
                          <strong className="text-amber-300 text-sm font-black">
                            {data[selectedMetric]} {currentMetricInfo.unit}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[11px]">
                          <span>재시도 및 오답률:</span>
                          <span className="font-bold text-rose-400">{data.difficultyRate}%</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[11px]">
                          <span>평균 해결 시간:</span>
                          <span className="font-bold text-sky-400">{data.avgTimeSeconds}초</span>
                        </div>
                        <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                          👆 클릭하여 상세 학습 처방 보기
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                className="cursor-pointer"
              >
                {chartData.map((entry) => {
                  const isSelected = selectedStage.id === entry.id;
                  const isHardest = entry.id === 'step3';
                  return (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={isHardest ? '#f43f5e' : entry.color}
                      stroke={isSelected ? '#1e1b4b' : isHardest ? '#be123c' : undefined}
                      strokeWidth={isSelected ? 3 : 1}
                      opacity={isSelected ? 1 : 0.85}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend & Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-200">
          {chartData.map((stage) => {
            const isSelected = selectedStage.id === stage.id;
            return (
              <button
                key={`btn-${stage.id}`}
                onClick={() => setSelectedStage(stage)}
                className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {stage.shortName}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                  {stage[selectedMetric]} {currentMetricInfo.unit}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                  {stage.id === 'step3' ? '🚨 오답률 74.8% (최고)' : `오답률 ${stage.difficultyRate}%`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* In-depth Stage Diagnosis & Teacher Prescription (선택한 단계의 심층 오답 분석 및 선생님 팁) */}
      <div className="mt-5 rounded-2xl border-2 border-indigo-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: selectedStage.color }}
            />
            <h4 className="text-base sm:text-lg font-black text-slate-900">
              {selectedStage.stageName}
            </h4>
          </div>
          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 self-start sm:self-center">
            {selectedStage.badge}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Box 1: 학생들이 가장 많이 하는 실수 */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center gap-2 mb-2 text-rose-800 font-black text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>학생들이 가장 많이 빠지는 함정 (흔한 실수)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {selectedStage.commonMistake}
            </p>
            <div className="mt-2 text-[11px] font-semibold text-rose-900 bg-white/70 p-2 rounded-lg border border-rose-200/60">
              ⚠️ <strong>오개념 경고:</strong> {selectedStage.keyMisconception}
            </div>
          </div>

          {/* Box 2: 생명과학 선생님의 핵심 처방 팁 */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2 text-emerald-800 font-black text-xs sm:text-sm">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>선생님의 100점 학습 처방전 (완벽 극복 요령)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {selectedStage.teacherTip}
            </p>
            <div className="mt-2 text-[11px] font-bold text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>핵심: 1분열은 "상동 분리(2n➔n)", 2분열은 "분체 분리(n➔n)"를 구분하기!</span>
            </div>
          </div>
        </div>

        {/* Comparison with Current User's Performance */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-950 font-medium">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>나의 학습 피드백:</strong> 본 시뮬레이션을 끝까지 완주함으로써, 학생들이 가장 어려워하는{' '}
              <span className="text-rose-600 font-black">감수 2분열 자매염색분체 분리</span> 과정을 직접 체험하고
              성공적으로 학습했습니다!
            </span>
          </div>
          <span className="bg-indigo-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md shrink-0 self-end sm:self-auto shadow-xs">
            상위 10% 이해도 달성
          </span>
        </div>

        {/* Quick Review Navigation Button */}
        {onSelectStep && (
          <div className="mt-4 pt-3 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-600 font-medium">
              💡 학습 통계 분석을 토대로 헷갈렸던 단계를 다시 한 번 직접 조작해 보세요.
            </span>
            <button
              onClick={() => {
                if (selectedStage.id === 'step1') onSelectStep(1);
                else if (selectedStage.id === 'step2') onSelectStep(2);
                else if (selectedStage.id === 'step3') onSelectStep(3);
                else onSelectStep(2);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-cyan-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-indigo-600"
            >
              <span>{selectedStage.shortName} 바로 다시 실습하기</span>
              <span className="text-xs font-bold">➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
