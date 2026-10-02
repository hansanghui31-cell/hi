import React, { useState } from 'react';
import { SeminarConfig, RegistrationRecord } from '../types';
import { 
  Smartphone, 
  Monitor, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Video, 
  RefreshCw, 
  Send 
} from 'lucide-react';
import seminarBannerImg from '../assets/images/seminar_banner_1790923790176.jpg';

interface LiveFormSimulatorProps {
  config: SeminarConfig;
  onRegisterSuccess: (record: RegistrationRecord) => void;
  goToSheet: () => void;
  goToEmail: () => void;
}

export const LiveFormSimulator: React.FC<LiveFormSimulatorProps> = ({
  config,
  onRegisterSuccess,
  goToSheet,
  goToEmail,
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSession, setSelectedSession] = useState(
    config.sessions[0] ? `[${config.sessions[0].code}] ${config.sessions[0].title}` : ''
  );
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<RegistrationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickFill = () => {
    setName('김하늘');
    setEmail('haneul.kim@partner.co.kr');
    setSelectedSession(
      config.sessions[1] 
        ? `[${config.sessions[1].code}] ${config.sessions[1].title}` 
        : `[${config.sessions[0].code}] ${config.sessions[0].title}`
    );
    setQuestion('사내에서 실무자 20명이 동시에 접속할 때 구글 Apps Script 실행 속도나 트래픽 제어가 원활한지 알고 싶습니다!');
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !selectedSession) {
      setErrorMessage('이름, 이메일 주소, 세션 선택은 필수 항목입니다.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('유효한 이메일 주소 형식을 입력해 주세요 (예: user@company.com).');
      return;
    }

    setIsLoading(true);

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const matched = selectedSession.match(/\[(.*?)\]/);
    const sessionCode = matched ? matched[1] : '세션';

    const newRecord: RegistrationRecord = {
      id: `reg-${Date.now()}`,
      timestamp: dateStr,
      name: name.trim(),
      email: email.trim(),
      sessionCode: sessionCode,
      sessionTitle: selectedSession,
      question: question.trim(),
      status: '등록완료',
    };

    const payload = {
      name: name.trim(),
      email: email.trim(),
      session: selectedSession,
      question: question.trim(),
    };

    // If real deployed Google Apps Script URL is set (e.g. deployed on Vercel)
    if (config.gasApiUrl && config.gasApiUrl.trim().startsWith('http')) {
      fetch(config.gasApiUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors', // Google Apps Script redirects on POST
      })
        .then(() => {
          onRegisterSuccess(newRecord);
          setLastSubmitted(newRecord);
          setIsLoading(false);
          setIsSuccess(true);
        })
        .catch((err) => {
          console.warn('GAS fetch notice (handled):', err);
          onRegisterSuccess(newRecord);
          setLastSubmitted(newRecord);
          setIsLoading(false);
          setIsSuccess(true);
        });
    } else {
      // Local / preview simulation mode
      setTimeout(() => {
        onRegisterSuccess(newRecord);
        setLastSubmitted(newRecord);
        setIsLoading(false);
        setIsSuccess(true);
      }, 1000);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setQuestion('');
    setErrorMessage('');
    setIsSuccess(false);
  };

  return (
    <div className="w-full">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white">
            온라인 참가 신청 창구 실시간 체험
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            구글 Apps Script 웹앱으로 배포되었을 때 참가자가 실제로 접하게 될 화면입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Auto-fill button */}
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>샘플 데이터 자동 입력</span>
          </button>

          {/* Desktop / Mobile view toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-750 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC 뷰</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>모바일 뷰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center items-start">
        <div
          className={`transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'w-full max-w-[420px] rounded-[36px] p-3 bg-slate-950 border-4 border-slate-750 shadow-2xl relative'
              : 'w-full max-w-2xl'
          }`}
        >
          {/* Mobile phone camera notch simulation */}
          {viewMode === 'mobile' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-3"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
            </div>
          )}

          {/* Actual WebApp Content Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Banner Header */}
            <div className="relative overflow-hidden border-b border-slate-800">
              <div className="h-32 sm:h-40 w-full relative overflow-hidden">
                <img
                  src={seminarBannerImg}
                  alt="세미나 헤더 배경"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter brightness-[0.75]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
              </div>

              <div className="p-6 relative -mt-14 sm:-mt-16">
                <div className="text-[11px] font-semibold text-indigo-400 tracking-wider uppercase mb-1.5">
                  {config.organizer}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {config.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {config.subtitle}
                </p>

                {/* Meta Information */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{config.dateTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{config.locationAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form or Success State */}
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {/* 1. Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    참가자 성함 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="reg-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                  />
                </div>

                {/* 2. Email */}
                <div>
                  <label htmlFor="reg-email" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    참가자 이메일 주소 <span className="text-rose-400">*</span>
                    <span className="text-[11px] font-normal text-slate-400 ml-1">
                      (입장 안내장 및 Zoom 링크 발송용)
                    </span>
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                  />
                </div>

                {/* 3. Session Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    참석 희망 세션 선택 <span className="text-rose-400">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {config.sessions.map((s) => {
                      const fullVal = `[${s.code}] ${s.title}`;
                      const isChecked = selectedSession === fullVal;
                      return (
                        <label
                          key={s.id}
                          className={`relative flex items-start p-3.5 rounded-xl border transition cursor-pointer ${
                            isChecked
                              ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500'
                              : 'border-slate-750 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-650'
                          }`}
                        >
                          <input
                            type="radio"
                            name="live-session"
                            value={fullVal}
                            checked={isChecked}
                            onChange={() => setSelectedSession(fullVal)}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                            required
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs sm:text-sm font-semibold text-white">
                                [{s.code}] {s.title}
                              </span>
                              <span className="text-[11px] font-medium text-indigo-300">
                                {s.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {s.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                              <span>강사: {s.speaker}</span>
                              <span>·</span>
                              <span>시간: {s.time}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Pre-question */}
                <div>
                  <label htmlFor="reg-question" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    강사님께 남기는 사전 질문{' '}
                    <span className="text-[11px] font-normal text-slate-400">(선택 사항)</span>
                  </label>
                  <textarea
                    id="reg-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    placeholder="평소 업무 자동화 시 막혔던 점이나 세미나에서 꼭 다뤄주었으면 하는 질문을 적어주세요."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition resize-none"
                  ></textarea>
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl">
                    {errorMessage}
                  </div>
                )}

                {/* 5. Submit Button with Spinner */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>구글 시트 저장 및 안내장 발송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-indigo-200" />
                      <span>참가 신청 확정하기</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500">
                  제출 즉시 구글 스프레드시트에 누적되며 지메일로 맞춤 입장 안내장이 발송됩니다.
                </p>
              </form>
            ) : (
              /* Success Confirmation Screen */
              <div className="p-6 sm:p-10 text-center">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                  참가 신청이 확정되었습니다!
                </h3>
                <p className="text-xs sm:text-sm text-indigo-300 font-medium mb-6">
                  입력하신 메일로 입장 안내장을 발송했습니다.
                </p>

                {lastSubmitted && (
                  <div className="bg-slate-800/80 border border-slate-750 rounded-xl p-4 sm:p-5 text-left text-xs sm:text-sm text-slate-300 mb-6 space-y-2.5">
                    <div className="flex justify-between pb-2 border-b border-slate-700/60">
                      <span className="text-slate-400">참가자 성함</span>
                      <span className="font-semibold text-white">{lastSubmitted.name} 님</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-700/60">
                      <span className="text-slate-400">안내장 발송 이메일</span>
                      <span className="text-indigo-300 font-mono">{lastSubmitted.email}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-700/60">
                      <span className="text-slate-400">선택 세션</span>
                      <span className="font-medium text-slate-200 text-right">{lastSubmitted.sessionTitle}</span>
                    </div>
                    {lastSubmitted.question && (
                      <div className="pt-1">
                        <span className="text-slate-400 block mb-1">등록된 사전 질문:</span>
                        <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-300 text-xs italic">
                          "{lastSubmitted.question}"
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Next Action Navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  <button
                    onClick={goToSheet}
                    className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>📊 누적된 스프레드시트 확인</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={goToEmail}
                    className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>✉️ 발송된 지메일 안내장 확인</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>다른 참가자 추가 등록하기</span>
                </button>
              </div>
            )}

            {/* Card Footer */}
            <footer className="px-6 py-3.5 bg-slate-950/70 border-t border-slate-800/80 text-center text-xs text-slate-500">
              {config.organizer} · 문의: {config.contactEmail}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
