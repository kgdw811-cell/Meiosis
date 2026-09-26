import JSZip from 'jszip';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  parents?: string[];
}

export const listDriveFiles = async (accessToken: string): Promise<DriveFile[]> => {
  const query = encodeURIComponent("trashed = false and (name contains '감수분열' or name contains 'meiosis' or name contains '시뮬레이션')");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,parents)&orderBy=modifiedTime desc&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `구글 드라이브 파일 목록을 가져오지 못했습니다 (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Upload text/html content directly to Google Drive (default: root folder)
 */
export const uploadReportToDrive = async (
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/html',
  parents: string[] = ['root']
): Promise<DriveFile> => {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: parents,
    description: '감수분열(생식세포 분열) 중3 과학 시뮬레이션 탐구 보고서 및 인증서',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `구글 드라이브 최상위 폴더 업로드에 실패했습니다 (${response.status})`);
  }

  return await response.json();
};

/**
 * Upload binary file (such as ZIP archive) directly to Google Drive root folder
 */
export const uploadBinaryToDriveRoot = async (
  accessToken: string,
  fileName: string,
  blob: Blob,
  mimeType: string = 'application/zip',
  parents: string[] = ['root']
): Promise<DriveFile> => {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: parents,
    description: '감수분열 2n=6 인터랙티브 시뮬레이터 전체 프로젝트 백업 ZIP 아카이브',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' })
  );
  form.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `구글 드라이브 최상위 폴더에 프로젝트 저장을 실패했습니다 (${response.status})`);
  }

  return await response.json();
};

export const deleteDriveFile = async (accessToken: string, fileId: string): Promise<boolean> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `파일 삭제에 실패했습니다 (${response.status})`);
  }

  return true;
};

export const generateMeiosisReportHTML = (studentName: string, dateStr: string = new Date().toLocaleDateString('ko-KR')): string => {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>감수분열 탐구 완료 증서 - ${studentName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f0f9ff;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 4px solid #facc15;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      margin: 0 0 8px 0;
      color: #0c4a6e;
    }
    .student {
      font-size: 18px;
      font-weight: 700;
      color: #0284c7;
      margin-top: 8px;
    }
    .content {
      line-height: 1.7;
      font-size: 15px;
      color: #334155;
    }
    .table-box {
      margin-top: 24px;
      background: #f8fafc;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    th {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
    }
    .highlight {
      color: #0284c7;
      font-weight: 700;
    }
    .footer {
      margin-top: 32px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">✨ 구글 드라이브 최상위 폴더 연동 탐구 인증서</div>
      <h1>생식세포 분열(감수분열) 탐구 완료 증서</h1>
      <div class="student">탐구자 / 학생: <strong>${studentName}</strong></div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">탐구 일자: ${dateStr}</div>
    </div>

    <div class="content">
      <p>
        위 학생은 3쌍의 상동염색체(2n = 6)를 활용하여 <strong>2가 염색체 접합(전기 I)</strong>, 
        <strong>상동염색체 분리(감수 1분열, 2n ➔ n)</strong>, 및 <strong>자매염색분체 분리(감수 2분열, n ➔ n)</strong> 
        전 과정을 직접 가상 조작하고 핵심 개념 퀴즈를 모두 통과하여 탐구를 성공적으로 완수하였음을 인증합니다.
      </p>

      <div class="table-box">
        <h3 style="margin-top: 0; font-size: 16px; color: #0f172a;">📊 감수분열 핵심 요약 표</h3>
        <table>
          <thead>
            <tr>
              <th>구분</th>
              <th>감수 1분열 (제1분열)</th>
              <th>감수 2분열 (제2분열)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>분리 대상</strong></td>
              <td class="highlight">상동염색체 분리</td>
              <td class="highlight">자매염색분체 분리</td>
            </tr>
            <tr>
              <td><strong>염색체 수 변화</strong></td>
              <td style="color: #e11d48; font-weight: 700;">2n = 6 ➔ n = 3 (반감★)</td>
              <td>n = 3 ➔ n = 3 (유지)</td>
            </tr>
            <tr>
              <td><strong>DNA 상대량 변화</strong></td>
              <td>4 ➔ 2</td>
              <td style="color: #059669; font-weight: 700;">2 ➔ 1 (반감★)</td>
            </tr>
            <tr>
              <td><strong>최종 형성 세포</strong></td>
              <td colspan="2" style="text-align: center; font-weight: 700; color: #0284c7;">
                총 4개의 생식세포 (각각 n = 3, 유전적 다양성 확보)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      Google AI Studio 감수분열 인터랙티브 시뮬레이션 | Google Drive 최상위 폴더 저장 보고서
    </div>
  </div>
</body>
</html>`;
};
