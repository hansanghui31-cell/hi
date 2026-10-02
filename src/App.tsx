import React, { useState } from 'react';
import { SeminarConfig, RegistrationRecord, ActiveTab } from './types';
import { initialSeminarConfig, sampleRegistrations } from './data/defaultConfig';
import { Navbar } from './components/Navbar';
import { LiveFormSimulator } from './components/LiveFormSimulator';
import { VirtualSheetViewer } from './components/VirtualSheetViewer';
import { EmailPreviewTab } from './components/EmailPreviewTab';
import { CodeExportTab } from './components/CodeExportTab';
import { DeploymentGuideTab } from './components/DeploymentGuideTab';
import { SettingsModal } from './components/SettingsModal';
import { Check, Info, FileSpreadsheet, Mail, Code2, BookOpen, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('demo');
  const [config, setConfig] = useState<SeminarConfig>(initialSeminarConfig);
  const [records, setRecords] = useState<RegistrationRecord[]>(sampleRegistrations);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRegisterSuccess = (newRecord: RegistrationRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    showToast(`"${newRecord.name}"님의 참가 신청이 완료되었습니다! (시트 저장 & 지메일 발송)`);
  };

  const handleAddSample = () => {
    const sampleNames = ['이지현', '최우진', '강다은', '문성호', '오수빈'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomSession = config.sessions[Math.floor(Math.random() * config.sessions.length)];

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newRecord: RegistrationRecord = {
      id: `reg-${Date.now()}`,
      timestamp: dateStr,
      name: randomName,
      email: `${randomName.toLowerCase()}_sample@corp.com`,
      sessionCode: randomSession.code,
      sessionTitle: `[${randomSession.code}] ${randomSession.title}`,
      question: '현업 부서에서 실습 시 필요한 사전 권한이 추가로 있는지 궁금합니다.',
      status: '등록완료',
    };

    setRecords((prev) => [newRecord, ...prev]);
    showToast(`테스트 참가자 "${randomName}"님이 추가되었습니다.`);
  };

  const handleClearRecords = () => {
    if (window.confirm('가상 스프레드시트의 모든 접수 기록을 비우시겠습니까?')) {
      setRecords([]);
      showToast('스프레드시트 데이터가 초기화되었습니다.');
    }
  };

  const handleSaveConfig = (newConfig: SeminarConfig) => {
    setConfig(newConfig);
    showToast('세미나 정보와 소스코드가 새 설정으로 동기화되었습니다.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        recordCount={records.length}
      />

      {/* Hero Overview Bar */}
      <section className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 mb-1">
                <span>Google Apps Script 자동화 마스터 허브</span>
                <span>·</span>
                <span>원데이 클래스 &amp; 사내 세미나</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {config.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                신청 웹창구(index.html) → 구글 스프레드시트 행 누적(Code.gs) → 지메일 맞춤 확정 안내장 발송 100% 원클릭 실무 자동화
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shrink-0 text-xs">
              <div className="px-2">
                <span className="text-slate-400 block text-[11px]">누적 참가자</span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {records.length}
                </span>
                <span className="text-[11px] text-slate-500 ml-1">명</span>
              </div>
              <div className="h-8 w-px bg-slate-850"></div>
              <div className="px-2">
                <span className="text-slate-400 block text-[11px]">메일 발송</span>
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>실시간 자동</span>
                </span>
              </div>
              <div className="h-8 w-px bg-slate-850"></div>
              <div className="px-2">
                <span className="text-slate-400 block text-[11px]">배포 대상</span>
                <span className="text-indigo-300 font-mono text-xs block mt-1">
                  Anyone (모든사용자)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'demo' && (
          <LiveFormSimulator
            config={config}
            onRegisterSuccess={handleRegisterSuccess}
            goToSheet={() => setActiveTab('sheet')}
            goToEmail={() => setActiveTab('email')}
          />
        )}

        {activeTab === 'sheet' && (
          <VirtualSheetViewer
            records={records}
            config={config}
            onAddSample={handleAddSample}
            onClearRecords={handleClearRecords}
          />
        )}

        {activeTab === 'email' && (
          <EmailPreviewTab records={records} config={config} />
        )}

        {activeTab === 'code' && (
          <CodeExportTab
            config={config}
            onUpdateConfig={handleSaveConfig}
            onGoToGuide={() => setActiveTab('guide')}
          />
        )}

        {activeTab === 'guide' && (
          <DeploymentGuideTab onGoToCode={() => setActiveTab('code')} />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">구글 앱스 스크립트 실무 자동화 개발 센터</span>
            <span>·</span>
            <span>Google Apps Script &amp; Gmail Automation Suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('guide')} className="hover:text-white cursor-pointer">
              배포 매뉴얼
            </button>
            <button onClick={() => setActiveTab('code')} className="hover:text-white cursor-pointer">
              전체 코드
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-white cursor-pointer">
              정보 설정
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
