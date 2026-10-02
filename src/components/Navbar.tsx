import React from 'react';
import { ActiveTab } from '../types';
import { Sparkles, Sliders, ExternalLink } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openSettings: () => void;
  recordCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  recordCount,
}) => {
  const navItems: { id: ActiveTab; label: string; count?: number }[] = [
    { id: 'demo', label: '신청창구 체험' },
    { id: 'sheet', label: '시트 자동 누적', count: recordCount },
    { id: 'email', label: '지메일 안내장' },
    { id: 'code', label: 'Apps Script 소스' },
    { id: 'guide', label: '3분 배포 가이드' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-500/30">
              GAS
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('demo'); }}
              className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors whitespace-nowrap"
            >
              세미나 신청 &amp; GAS 자동화 센터
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && (
                    <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 bg-indigo-950/70 border border-indigo-700/40 text-indigo-300 rounded">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={openSettings}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="세미나 제목, 일시, 세션 내용 커스터마이징"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">세미나 정보 설정</span>
              <span className="sm:hidden">설정</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>코드 복사</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {typeof item.count === 'number' && ` (${item.count})`}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
