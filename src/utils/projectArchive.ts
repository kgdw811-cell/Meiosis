import JSZip from 'jszip';

export const buildProjectZip = async (): Promise<Blob> => {
  const zip = new JSZip();

  // Root project meta
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'meiosis-simulation-2n6',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite --port=3000 --host=0.0.0.0',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          '@google/genai': '^2.4.0',
          '@tailwindcss/vite': '^4.1.14',
          '@types/canvas-confetti': '^1.9.0',
          '@vitejs/plugin-react': '^5.0.4',
          'canvas-confetti': '^1.9.4',
          dotenv: '^17.2.3',
          express: '^4.21.2',
          firebase: '^12.18.0',
          jszip: '^3.10.1',
          'lucide-react': '^0.546.0',
          motion: '^12.23.24',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          tailwindcss: '^4.1.14',
          vite: '^6.2.3',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'metadata.json',
    JSON.stringify(
      {
        name: '감수분열 직접 진행해보기',
        description:
          '중학교 3학년 생식과 유전: 2n=6 생식세포 분열(감수분열) 인터랙티브 시뮬레이터 및 Google Drive 탐구 보고서 연동',
        requestFramePermissions: [],
        majorCapabilities: ['MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API'],
      },
      null,
      2
    )
  );

  zip.file(
    'README.md',
    `# 🧬 감수분열(생식세포 분열, 2n=6) 인터랙티브 시뮬레이터

중학교 3학년 과학 교육과정(생식과 유전 단원)에 최적화된 인터랙티브 생명과학 탐구 시뮬레이션입니다.

## ✨ 주요 특징 및 탐구 단계
1. **STEP 1 (감수 1분열 전기 - 2가 염색체 접합)**:
   - 3쌍의 상동염색체(2n=6)를 크기별로 매칭하여 2가 염색체(4분 염색체) 형성
2. **STEP 2 (감수 1분열 후기 - 상동염색체 분리)**:
   - 좌우 중심체에서 뻗어나온 방추사(#BCBCBC)가 상동염색체를 양극으로 분리 견인 (2n=6 ➔ n=3, 염색체수 반감)
3. **STEP 3 (감수 2분열 후기 - 자매염색분체 분리)**:
   - 가로형 X자 복제 염색체의 가운데 공유 동원체가 쪼개지며 상하 양극으로 분리 (n=3 ➔ n=3, DNA량 반감)
4. **STEP 4 (탐구 완료 보고서 & 구글 드라이브 백업)**:
   - 탐구 인증서 발급 및 Google Drive 최상위 폴더 자동 백업

## 🚀 실행 방법
\`\`\`bash
npm install
npm run dev
\`\`\`
`
  );

  // Source files description / bundle info
  const srcFolder = zip.folder('src');
  if (srcFolder) {
    srcFolder.file(
      'PROJECT_INFO.txt',
      `프로젝트: 감수분열(2n=6) 인터랙티브 시뮬레이션\n생성일시: ${new Date().toISOString()}\n플랫폼: Google AI Studio / React 19 + Tailwind CSS + Vite\n저장위치: Google Drive 최상위(Root) 폴더`
    );
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
};
