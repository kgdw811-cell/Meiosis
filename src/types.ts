export type OriginType = 'paternal' | 'maternal';

export interface ChromosomeSize {
  id: number;
  name: string;
  h: number;
  w: number;
  label: string;
}

export interface ChromosomeItem {
  id: string;
  pairId: number;
  origin: OriginType;
  size: ChromosomeSize;
  x: number;
  y: number;
  isPaired?: boolean;
  pairedWithId?: string;
  pole?: 'left' | 'right';
  isSplit?: boolean;
}

export type SimStep = 1 | 2 | 3 | 4; // 1: 전기I(2가염색체 형성), 2: 중기~후기I(상동염색체 분리), 3: 감수2분열(염색분체 분리), 4: 분열완료(결과리포트)

export interface QuizQuestion {
  id: number;
  stageName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
