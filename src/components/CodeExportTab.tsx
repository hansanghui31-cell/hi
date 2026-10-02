import React, { useState } from 'react';
import { SeminarConfig } from '../types';
import { generateGasCode, generateIndexHtml } from '../utils/gasCodeGenerator';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  HelpCircle, 
  FileSpreadsheet, 
  Link, 
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface CodeExportTabProps {
  config: SeminarConfig;
  onUpdateConfig: (newConfig: SeminarConfig) => void;
  onGoToGuide: () => void;
}

export const CodeExportTab: React.FC<CodeExportTabProps> = ({
  config,
  onUpdateConfig,
  onGoToGuide,
}) => {
  const [selectedFile, setSelectedFile] = useState<'Code.gs' | 'index.html'>('Code.gs');
  const [copied, setCopied] = useState(false);
  const [inputUrlOrId, setInputUrlOrId] = useState(config.spreadsheetId || '');

  const gasCode = generateGasCode(config);
  const indexHtml = generateIndexHtml(config);

  const currentCode = selectedFile === 'Code.gs' ? gasCode : indexHtml;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract ID from full Google Sheets URL if pasted
  const handleSheetIdChange = (rawText: string) => {
    setInputUrlOrId(rawText);
    let extractedId = rawText.trim();

    // Regex to extract Google Spreadsheet ID from URL
    const match = rawText.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    onUpdateConfig({
      ...config,
      spreadsheetId: extractedId,
      sheetMode: extractedId ? 'id' : 'active',
    });
  };

  const setConnectionMode = (mode: 'active' | 'id') => {
    if (mode === 'active') {
      setInputUrlOrId('');
      onUpdateConfig({
        ...config,
        sheetMode: 'active',
        spreadsheetId: '',
      });
    } else {
      onUpdateConfig({
        ...config,
        sheetMode: 'id',
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              구글 시트 자동 연결 &amp; Apps Script 마스터 소스코드
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            아래 설정에서 구글 시트 연결 방식을 선택하면, 연동 코드가 실시간으로 자동 갱신됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToGuide}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>배포 가이드</span>
          </button>
          <button
            onClick={() => handleDownload(selectedFile, currentCode)}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{selectedFile} 다운로드</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-200" />
                <span>{selectedFile} 전체 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Google Sheets Connection Setting Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              구글 스프레드시트 연결 모드 설정
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setConnectionMode('active')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                config.sheetMode === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. 현재 시트 자동 연결 (권장)
            </button>
            <button
              onClick={() => setConnectionMode('id')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                config.sheetMode === 'id'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. 특정 시트 ID / URL 지정
            </button>
          </div>
        </div>

        {/* Mode Explanations & Input */}
        {config.sheetMode === 'active' ? (
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">현재 시트 자동 연결 방식 (SpreadsheetApp.getActiveSpreadsheet())</strong>
              구글 시트 상단 메뉴의 <strong>[확장 프로그램] → [Apps Script]</strong>를 누르면 스크립트가 해당 구글 시트와 <strong>자동으로 100% 영구 연결</strong>됩니다. 별도의 시트 ID를 입력하지 않아도 되므로 가장 간단하고 추천되는 방식입니다.
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-750 space-y-3">
            <div className="text-xs text-slate-300 flex items-start gap-2">
              <Link className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                연결하고 싶은 구글 스프레드시트의 <strong>전체 웹 주소(URL)</strong> 또는 <strong>시트 ID</strong>를 아래에 붙여넣으세요. 코드가 즉시 해당 시트 ID를 바라보도록 자동 생성됩니다.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="예: https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit 또는 시트 ID"
                  value={inputUrlOrId}
                  onChange={(e) => handleSheetIdChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 h-full text-xs text-slate-400">
                  <span>추출된 ID:</span>
                  <span className="font-mono text-indigo-300 font-semibold truncate max-w-[140px]">
                    {config.spreadsheetId ? config.spreadsheetId : '(미입력시 자동 폴백)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Name Setting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>데이터 누적 탭 이름:</span>
            <input
              type="text"
              value={config.sheetTabName || '참가자명단'}
              onChange={(e) => onUpdateConfig({ ...config, sheetTabName: e.target.value })}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
            />
            <span className="text-[11px] text-slate-500">(시트에 해당 탭이 없으면 스크립트가 자동 생성합니다)</span>
          </div>

          <div className="text-[11px] text-slate-400">
            시트 헤더 6개 컬럼 <span className="font-mono text-indigo-300">[접수일시, 이름, 이메일, 선택세션, 사전질문, 등록상태]</span> 자동 생성 포함
          </div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => { setSelectedFile('Code.gs'); setCopied(false); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            selectedFile === 'Code.gs'
              ? 'bg-indigo-950/70 border border-indigo-700/50 text-indigo-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>1. Code.gs (구글 시트 자동 연결 &amp; 지메일 발송)</span>
        </button>

        <button
          onClick={() => { setSelectedFile('index.html'); setCopied(false); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            selectedFile === 'index.html'
              ? 'bg-indigo-950/70 border border-indigo-700/50 text-indigo-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>2. index.html (참가자 신청창구 반응형 UI)</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs shadow-2xl">
        {/* Editor Top Bar */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-slate-400 text-[11px] ml-2 font-sans font-medium">
              {selectedFile}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '복사됨' : '전체 복사'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto max-h-[560px] text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          <pre className="text-[12px] whitespace-pre font-mono">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
