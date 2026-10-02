import React, { useState } from 'react';
import { RegistrationRecord, SeminarConfig } from '../types';
import { 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Check, 
  ExternalLink,
  Info
} from 'lucide-react';

interface VirtualSheetViewerProps {
  records: RegistrationRecord[];
  config: SeminarConfig;
  onAddSample: () => void;
  onClearRecords: () => void;
}

export const VirtualSheetViewer: React.FC<VirtualSheetViewerProps> = ({
  records,
  config,
  onAddSample,
  onClearRecords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const filteredRecords = records.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['접수일시', '이름', '이메일', '선택세션', '사전질문', '등록상태'];
    const rows = records.map((r) => [
      `"${r.timestamp}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.sessionTitle.replace(/"/g, '""')}"`,
      `"${(r.question || '').replace(/"/g, '""')}"`,
      `"${r.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `세미나_참가자_명단_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* Control & Header Information */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              구글 스프레드시트 실시간 누적 현황 시뮬레이터
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            GAS 스크립트 <code className="text-indigo-300 font-mono text-[11px]">sheet.appendRow()</code> 가 실행되어 시트 맨 아래에 데이터가 쌓이는 구조를 완벽하게 재현합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddSample}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>테스트 참가자 추가</span>
          </button>
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-700/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV 다운로드</span>
          </button>
          <button
            onClick={onClearRecords}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="시트 행 전체 비우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sheets Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Google Sheets mock top ribbon */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>2026_세미나_참가신청_접수마스터</span>
            </div>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 text-[11px]">
              총 <strong className="text-white font-mono tabular-nums">{records.length}</strong>건 접수됨
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="이름, 이메일, 세션 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-750 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Column letter row (A, B, C, D, E, F) */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {/* Excel Column Letters */}
              <tr className="bg-slate-950/70 border-b border-slate-800/80 text-[11px] text-slate-500 font-mono">
                <th className="w-12 px-2 py-1 text-center border-r border-slate-800 font-normal">#</th>
                <th className="px-3 py-1 border-r border-slate-800 font-normal">A</th>
                <th className="px-3 py-1 border-r border-slate-800 font-normal">B</th>
                <th className="px-3 py-1 border-r border-slate-800 font-normal">C</th>
                <th className="px-3 py-1 border-r border-slate-800 font-normal">D</th>
                <th className="px-3 py-1 border-r border-slate-800 font-normal">E</th>
                <th className="px-3 py-1 font-normal">F</th>
              </tr>
              {/* Row 1: Header Row (Created automatically by Code.gs) */}
              <tr className="bg-slate-950 text-white font-semibold border-b border-slate-800">
                <td className="w-12 px-2 py-3 text-center border-r border-slate-800 text-slate-400 font-mono text-[11px] bg-slate-950">
                  1
                </td>
                <td className="px-3 py-3 border-r border-slate-800/80 whitespace-nowrap min-w-[150px]">
                  <span className="text-indigo-300 mr-1.5 font-mono text-[10px]">col:</span>
                  접수일시
                </td>
                <td className="px-3 py-3 border-r border-slate-800/80 whitespace-nowrap min-w-[90px]">
                  이름
                </td>
                <td className="px-3 py-3 border-r border-slate-800/80 whitespace-nowrap min-w-[190px]">
                  이메일
                </td>
                <td className="px-3 py-3 border-r border-slate-800/80 whitespace-nowrap min-w-[240px]">
                  선택세션
                </td>
                <td className="px-3 py-3 border-r border-slate-800/80 whitespace-nowrap min-w-[260px]">
                  사전질문
                </td>
                <td className="px-3 py-3 whitespace-nowrap min-w-[100px] text-center">
                  등록상태
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => {
                  const rowNumber = idx + 2; // Row 1 is header
                  const isSelected = selectedRow === rowNumber;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRow(isSelected ? null : rowNumber)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-950/30' 
                          : 'hover:bg-slate-850/60 bg-slate-900/50'
                      }`}
                    >
                      <td className="w-12 px-2 py-2.5 text-center border-r border-slate-800 text-slate-500 font-mono text-[11px] bg-slate-950/40">
                        {rowNumber}
                      </td>
                      <td className="px-3 py-2.5 border-r border-slate-800/60 font-mono text-[11px] text-slate-400 whitespace-nowrap tabular-nums">
                        {r.timestamp}
                      </td>
                      <td className="px-3 py-2.5 border-r border-slate-800/60 font-medium text-white whitespace-nowrap">
                        {r.name}
                      </td>
                      <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-300 font-mono text-xs whitespace-nowrap">
                        {r.email}
                      </td>
                      <td className="px-3 py-2.5 border-r border-slate-800/60 text-indigo-300 whitespace-nowrap font-medium">
                        {r.sessionTitle}
                      </td>
                      <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-400 max-w-xs truncate" title={r.question}>
                        {r.question ? r.question : <span className="text-slate-600">(없음)</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>{r.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm">등록된 신청 내역이 없습니다.</p>
                    <p className="text-xs text-slate-600 mt-1">
                      '신청창구 체험' 탭에서 참가 신청서를 제출하면 이곳에 실시간으로 추가됩니다.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Footer Sheet Tabs */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 bg-slate-900 border-t-2 border-emerald-500 text-white font-medium rounded-t text-xs">
              참가자명단
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>헤더 1행은 Code.gs의 ensureHeaderRow() 함수에 의해 자동으로 생성 및 서식화됩니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
