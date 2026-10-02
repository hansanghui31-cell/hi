import React, { useState } from 'react';
import { RegistrationRecord, SeminarConfig } from '../types';
import { 
  Mail, 
  Star, 
  Reply, 
  MoreVertical, 
  Printer, 
  ExternalLink, 
  User, 
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';

interface EmailPreviewTabProps {
  records: RegistrationRecord[];
  config: SeminarConfig;
}

export const EmailPreviewTab: React.FC<EmailPreviewTabProps> = ({ records, config }) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records[0]?.id || 'sample'
  );
  const [copiedSubject, setCopiedSubject] = useState(false);

  const currentRecord = records.find((r) => r.id === selectedRecordId) || records[0] || {
    id: 'sample',
    name: '김하늘',
    email: 'haneul.kim@partner.co.kr',
    sessionCode: '세션 A',
    sessionTitle: '[세션 A] 생성형 AI 업무 자동화 실전',
    question: 'GAS 실행 시 일일 이메일 발송 쿼터(Quota) 제한을 우회하거나 관리하는 모범 사례가 궁금합니다.',
    timestamp: '2026-10-02 14:20:00',
    status: '등록완료',
  };

  const emailSubject = `[참가 확정] ${currentRecord.name}님, 신청하신 세미나 등록이 정상 완료되었습니다.`;

  const copySubject = () => {
    navigator.clipboard.writeText(emailSubject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              지메일(Gmail) 맞춤 확정 안내장 실시간 미리보기
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            구글 시트에 행이 추가되는 즉시 <code className="text-indigo-300 font-mono text-[11px]">GmailApp.sendEmail()</code>로 자동 발송되는 HTML 메일 원형입니다.
          </p>
        </div>

        {/* Participant Switcher Dropdown */}
        {records.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">수신자 선택:</span>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Gmail Mockup Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Gmail Header Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rose-600/90 flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="text-xs font-semibold text-slate-300">Gmail 자동 발송 시뮬레이터</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={copySubject}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700/60 flex items-center gap-1 cursor-pointer transition"
            >
              {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSubject ? '제목 복사됨' : '메일 제목 복사'}</span>
            </button>
          </div>
        </div>

        {/* Email Meta Area */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
              {emailSubject}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <Reply className="w-4 h-4 hover:text-white cursor-pointer" />
              <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-semibold">
                {config.organizer.slice(0, 1)}
              </div>
              <div>
                <div className="text-white font-medium">
                  {config.organizer}{' '}
                  <span className="text-slate-400 font-normal font-mono text-[11px]">
                    &lt;{config.contactEmail}&gt;
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  받는사람:{' '}
                  <strong className="text-slate-200 font-semibold">{currentRecord.name}</strong>{' '}
                  <span className="font-mono text-[11px]">&lt;{currentRecord.email}&gt;</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 tabular-nums">
              {currentRecord.timestamp} (방금 전 발송됨)
            </div>
          </div>
        </div>

        {/* Email Body Rendering Canvas (White container like real email clients) */}
        <div className="p-4 sm:p-8 bg-slate-950/60 overflow-x-auto flex justify-center">
          <div className="w-full max-w-[620px] bg-white text-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-200 text-left font-sans">
            
            {/* Branded Email Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white border-b-4 border-indigo-600">
              <span className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase block mb-1.5">
                {config.organizer}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight m-0 text-white">
                {config.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 m-0">
                {currentRecord.name}님의 세미나 참가 신청이 정상 확정되었습니다.
              </p>
            </div>

            {/* Email Main Content */}
            <div className="p-6 sm:p-8 text-slate-800 text-sm leading-relaxed space-y-5">
              <p className="m-0">
                안녕하세요, <strong className="text-indigo-900 font-semibold">{currentRecord.name}</strong>님!<br />
                본 행사에 관심을 갖고 참가 신청해 주셔서 진심으로 감사드립니다.<br />
                아래 배정되신 세션 및 상세 입장 안내 사항을 확인해 주시기 바랍니다.
              </p>

              {/* Information Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200/80">
                      <td className="py-2 text-slate-500 font-medium w-28">참가자 성함</td>
                      <td className="py-2 text-slate-900 font-semibold">{currentRecord.name} 님</td>
                    </tr>
                    <tr className="border-b border-slate-200/80">
                      <td className="py-2 text-slate-500 font-medium">선택 세션</td>
                      <td className="py-2 text-indigo-700 font-bold">{currentRecord.sessionTitle}</td>
                    </tr>
                    <tr className="border-b border-slate-200/80">
                      <td className="py-2 text-slate-500 font-medium">행사 일시</td>
                      <td className="py-2 text-slate-900">{config.dateTime}</td>
                    </tr>
                    <tr className="border-b border-slate-200/80">
                      <td className="py-2 text-slate-500 font-medium align-top">오프라인 장소</td>
                      <td className="py-2 text-slate-900">{config.locationAddress}</td>
                    </tr>
                    <tr className="border-b border-slate-200/80">
                      <td className="py-2 text-slate-500 font-medium align-top">온라인 Zoom</td>
                      <td className="py-2">
                        <a 
                          href={config.zoomLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 underline font-mono text-xs break-all"
                        >
                          {config.zoomLink}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-500 font-medium">접수 완료 시각</td>
                      <td className="py-2 text-slate-600 font-mono text-xs">{currentRecord.timestamp}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pre-event Question Notification */}
              {currentRecord.question ? (
                <div className="bg-indigo-50/70 border-l-4 border-indigo-500 p-4 rounded-r-md">
                  <div className="text-xs font-bold text-indigo-900 mb-1">
                    강사님께 남겨주신 사전 질문:
                  </div>
                  <div className="text-sm text-slate-700 italic">
                    "{currentRecord.question}"
                  </div>
                  <div className="text-xs text-indigo-600/80 mt-1">
                    * 위 질문은 강사님께 사전 전달되어 세미나 질의응답 시간에 다루어질 예정입니다.
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded text-xs text-slate-500">
                  (등록된 사전 질문이 없습니다. 행사 당일 실시간 질의응답 시간에도 자유롭게 문의하실 수 있습니다.)
                </div>
              )}

              {/* Preparation Items */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0 mb-2">
                  필수 준비물 &amp; 사전 안내 사항
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 m-0">
                  {config.preparationItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Signature / Contact Info */}
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-800">{config.organizer} 운영사무국</strong><br />
                이메일 문의: <span className="text-indigo-600 font-medium">{config.contactEmail}</span> · 전화: {config.contactPhone}<br />
                <span className="text-[11px] text-slate-400 block mt-1">
                  본 메일은 구글 스프레드시트 및 Apps Script 자동 발송 시스템을 통해 발송되었습니다.
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Gmail Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          실제 구글 계정으로 발송 시 수신자의 지메일, 네이버, 아웃룩 등 모든 메일 클라이언트에서 동일하게 깔끔하게 표시됩니다.
        </div>
      </div>
    </div>
  );
};
