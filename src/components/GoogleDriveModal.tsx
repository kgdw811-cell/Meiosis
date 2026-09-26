import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FileText,
  Trash2,
  ExternalLink,
  Upload,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  HardDrive,
  FolderRoot,
  Archive,
  FolderCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, getAccessToken } from '../utils/auth';
import {
  DriveFile,
  listDriveFiles,
  uploadReportToDrive,
  uploadBinaryToDriveRoot,
  deleteDriveFile,
  generateMeiosisReportHTML
} from '../utils/googleDrive';
import { buildProjectZip } from '../utils/projectArchive';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onAuthChange: (user: User | null) => void;
  studentName?: string;
  showToast: (msg: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onAuthChange,
  studentName = '중3 탐구자',
  showToast,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<DriveFile | null>(null);

  const fetchFiles = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const token = await getAccessToken();
      if (!token) {
        setErrorMessage('Google Drive 인증 토큰이 필요합니다. 다시 로그인해주세요.');
        return;
      }
      const fetched = await listDriveFiles(token);
      setFiles(fetched);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '파일 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchFiles();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user);
        showToast(`구글 계정(${res.user.displayName || res.user.email})으로 연결되었습니다!`);
        const fetched = await listDriveFiles(res.accessToken);
        setFiles(fetched);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage('구글 로그인에 실패했습니다. 팝업 창을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null);
      setFiles([]);
      setLastUploadedFile(null);
      showToast('구글 계정 연결이 해제되었습니다.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Upload Entire Project as ZIP directly to Google Drive Root folder
  const handleSaveProjectToRoot = async () => {
    try {
      setIsSavingProject(true);
      setErrorMessage(null);
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
          onAuthChange(res.user);
        } else {
          setErrorMessage('먼저 Google 계정으로 로그인해 주세요.');
          return;
        }
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `감수분열_2n10_인터랙티브시뮬레이터_프로젝트_${dateStr}.zip`;
      
      const zipBlob = await buildProjectZip();
      const uploaded = await uploadBinaryToDriveRoot(
        token,
        fileName,
        zipBlob,
        'application/zip',
        ['root']
      );

      setLastUploadedFile(uploaded);
      showToast('🚀 구글 드라이브 최상위(Root) 폴더에 프로젝트 백업 ZIP이 성공적으로 저장되었습니다!');
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '구글 드라이브 최상위 폴더 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingProject(false);
    }
  };

  // Upload Interactive Report to Google Drive Root folder
  const handleSaveReportToRoot = async () => {
    try {
      setIsSavingReport(true);
      setErrorMessage(null);
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
          onAuthChange(res.user);
        } else {
          setErrorMessage('먼저 Google 계정으로 로그인해 주세요.');
          return;
        }
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `감수분열_탐구완료증서_${studentName}_${dateStr}.html`;
      const htmlContent = generateMeiosisReportHTML(studentName);

      const saved = await uploadReportToDrive(token, fileName, htmlContent, 'text/html', ['root']);
      setLastUploadedFile(saved);
      showToast('✨ 구글 드라이브 최상위 폴더에 탐구 보고서가 저장되었습니다!');
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google Drive 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      setDeletingId(fileToDelete.id);
      const token = await getAccessToken();
      if (!token) {
        setErrorMessage('Google 계정 인증이 필요합니다.');
        return;
      }

      await deleteDriveFile(token, fileToDelete.id);
      showToast(`'${fileToDelete.name}' 파일이 삭제되었습니다.`);
      setFileToDelete(null);
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '파일 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
              <FolderRoot className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Google Drive 최상위 폴더 저장</h3>
              <p className="text-xs text-sky-100 font-medium">
                내 Google Drive 최상위(Root) 폴더에 프로젝트 및 탐구 보고서를 저장·관리합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-700 text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Account Status Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-emerald-400 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{user.displayName || '구글 사용자'}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FolderCheck className="w-3 h-3 text-emerald-600" />
                      내 드라이브 최상위 연결
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Google Drive 계정 연결 필요</span>
                </div>
                <div className="text-xs text-slate-500">
                  Google 계정으로 로그인하여 내 드라이브 최상위 폴더에 저장하세요.
                </div>
              </div>
            )}

            <div>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Save to Root Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Save Full Project ZIP */}
            <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-sky-50/70 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                  <Archive className="w-4 h-4 text-indigo-600" />
                  <span>프로젝트 전체 저장 (ZIP)</span>
                </div>
                <p className="text-xs text-indigo-700/80 leading-relaxed">
                  시뮬레이터 전체 소스코드와 설정을 압축하여 내 드라이브 최상위 폴더에 백업합니다.
                </p>
              </div>

              <button
                onClick={handleSaveProjectToRoot}
                disabled={isSavingProject}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className={`w-3.5 h-3.5 ${isSavingProject ? 'animate-bounce' : ''}`} />
                <span>{isSavingProject ? '최상위 폴더에 저장 중...' : '최상위 폴더에 프로젝트 저장'}</span>
              </button>
            </div>

            {/* Save HTML Report */}
            <div className="p-4 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/70 to-emerald-50/70 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>탐구 보고서 저장 (HTML)</span>
                </div>
                <p className="text-xs text-teal-700/80 leading-relaxed">
                  핵심 개념 요약표 및 감수분열 완료 인증서를 내 드라이브 최상위 폴더에 저장합니다.
                </p>
              </div>

              <button
                onClick={handleSaveReportToRoot}
                disabled={isSavingReport}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className={`w-3.5 h-3.5 ${isSavingReport ? 'animate-bounce' : ''}`} />
                <span>{isSavingReport ? '보고서 저장 중...' : '최상위 폴더에 보고서 저장'}</span>
              </button>
            </div>
          </div>

          {/* Last Upload Notification */}
          {lastUploadedFile && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-emerald-900 truncate">
                    최상위 폴더 저장 완료: {lastUploadedFile.name}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    저장 위치: Google Drive &gt; 내 드라이브 (Root)
                  </div>
                </div>
              </div>

              {lastUploadedFile.webViewLink && (
                <a
                  href={lastUploadedFile.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Drive에서 열기</span>
                </a>
              )}
            </div>
          )}

          {/* Files List in Root / Drive */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FolderRoot className="w-3.5 h-3.5 text-sky-600" />
                <span>내 Google Drive에 저장된 프로젝트 및 보고서</span>
                {files.length > 0 && <span className="text-sky-600 font-bold">({files.length}개)</span>}
              </h4>

              {user && (
                <button
                  onClick={fetchFiles}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="새로고침"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              )}
            </div>

            {!user ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Cloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">Google Drive와 연결되어 있지 않습니다</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  위의 구글 로그인 버튼을 눌러 계정을 연결하시면 내 Google Drive 최상위 폴더에 이
                  프로젝트를 즉시 저장하실 수 있습니다.
                </p>
              </div>
            ) : isLoading && files.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
                <span className="text-xs font-medium">Google Drive 파일을 불러오는 중...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">저장된 프로젝트 파일이 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">
                  위의 <strong>'최상위 폴더에 프로젝트 저장'</strong> 버튼을 눌러 첫 번째 백업을
                  생성해보세요!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {files.map((file) => {
                  const isZip = file.mimeType.includes('zip') || file.name.endsWith('.zip');
                  return (
                    <div
                      key={file.id}
                      className="p-3.5 hover:bg-sky-50/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isZip ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {isZip ? <Archive className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-xs truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleString('ko-KR')
                                : '날짜 정보 없음'}
                            </span>
                            <span className="text-sky-600 font-semibold">• 내 드라이브 (Root)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all flex items-center gap-1 border border-sky-200"
                            title="Google Drive에서 파일 열기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Drive에서 열기</span>
                          </a>
                        )}

                        <button
                          onClick={() => setFileToDelete(file)}
                          disabled={deletingId === file.id}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="파일 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Explicit User Confirmation Dialog for Destructive Delete */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-extrabold text-slate-900">Google Drive 파일 삭제</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                정말로 Google Drive에서 <strong>'{fileToDelete.name}'</strong> 파일을 삭제하시겠습니까?
                <br />
                <span className="text-rose-500 font-semibold">이 작업은 취소할 수 없습니다.</span>
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === fileToDelete.id}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md transition-all cursor-pointer"
              >
                {deletingId === fileToDelete.id ? '삭제 중...' : '확인 및 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
