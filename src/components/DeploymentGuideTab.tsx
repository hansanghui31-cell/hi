import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Layers,
  Globe
} from 'lucide-react';

interface DeploymentGuideTabProps {
  onGoToCode: () => void;
}

export const DeploymentGuideTab: React.FC<DeploymentGuideTabProps> = ({ onGoToCode }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const steps = [
    {
      num: 1,
      title: '구글 스프레드시트 생성 및 Apps Script 열기',
      summary: '참가자 데이터가 누적될 스프레드시트를 만들고 스크립트 편집기를 실행합니다.',
      details: [
        '인터넷 주소창에 sheets.new 를 입력해 새 구글 스프레드시트를 생성합니다.',
        '시트 상단 제목을 [2026_세미나_참가자_명단] 등 원하는 이름으로 변경합니다.',
        '상단 메뉴에서 [확장 프로그램] → [Apps Script]를 클릭합니다.',
      ],
      tip: '시트의 첫 번째 행 헤더는 스크립트가 실행될 때 자동으로 예쁘게 만들어지므로 빈 시트 상태여도 괜찮습니다.',
    },
    {
      num: 2,
      title: 'Code.gs 코드 붙여넣기 및 저장',
      summary: '서버 로직과 시트 저장, 지메일 발송을 담당하는 핵심 코드를 작성합니다.',
      details: [
        'Apps Script 편집기가 열리면 기본으로 있는 Code.gs 파일 내용(myFunction)을 모두 지웁니다.',
        '이 웹앱의 [Apps Script 소스] 탭에서 [Code.gs] 코드를 전체 복사합니다.',
        'Code.gs 편집기에 붙여넣고 상단의 💾 [프로젝트 저장] 아이콘(또는 Ctrl+S / Cmd+S)을 누릅니다.',
      ],
      tip: '코드 내의 세미나 일시, 장소, 안내 문구는 상단 [세미나 정보 설정]에서 자유롭게 수정한 뒤 복사하실 수 있습니다.',
    },
    {
      num: 3,
      title: 'index.html 파일 생성 및 붙여넣기',
      summary: '참가자가 웹 브라우저로 접속해 볼 반응형 신청창구 화면을 추가합니다.',
      details: [
        '좌측 파일 목록 상단의 [+] 버튼을 클릭하고 [HTML]을 선택합니다.',
        '파일 이름 입력란에 소문자로 index 를 입력하고 엔터를 칩니다 (확장자 .html은 자동 입력됨).',
        '생성된 index.html의 기존 내용을 모두 지웁니다.',
        '이 웹앱의 [Apps Script 소스] 탭에서 [index.html] 코드를 전체 복사하여 붙여넣고 💾 [저장]합니다.',
      ],
      tip: '파일명 철자가 정확히 index 여야 Code.gs의 createHtmlOutputFromFile(\'index\') 함수가 정상적으로 화면을 불러옵니다.',
    },
    {
      num: 4,
      title: '웹 앱(Web App)으로 새 배포 설정하기',
      summary: '누구나 브라우저에서 링크만 누르면 참가 신청할 수 있도록 외부 공개 배포합니다.',
      details: [
        '우측 상단 파란색 [배포] 버튼을 클릭하고 [새 배포]를 선택합니다.',
        '배포 창 좌측 상단 톱니바퀴 아이콘 ⚙️을 누르고 [웹 앱(Web app)]을 선택합니다.',
        '설정 옵션을 아래와 같이 반드시 지정합니다:',
        '• 설명: 세미나 참가 신청 v1 (원하는 설명 입력)',
        '• 다음 사용자로 실행: 나(본인 계정)',
        '• 액세스 권한이 있는 사용자: 모든 사용자(Anyone) ★가장 중요★',
      ],
      tip: '액세스 권한을 "모든 사용자(Anyone)"로 설정해야 구글 로그인을 하지 않은 일반 참가자나 사외 참석자도 바로 신청할 수 있습니다.',
    },
    {
      num: 5,
      title: '★핵심★ 구글 보안 경고 권한 승인 (10초 돌파법)',
      summary: '시트 쓰기 및 지메일 발송 권한을 최초 1회 승인합니다.',
      details: [
        '[배포] 버튼을 누르면 [액세스 승인(Authorize access)] 팝업이 뜹니다. 클릭합니다.',
        '본인의 구글 계정을 선택합니다.',
        '이때 "Google에서 확인하지 않은 앱(Google hasn\'t verified this app)"이라는 큰 경고창이 나타납니다.',
        '당황하지 마시고 좌측 하단의 작은 글씨 [고급(Advanced)]을 클릭합니다.',
        '아래쪽에 나타나는 [(안전하지 않음)으로 이동]을 클릭합니다.',
        '마지막으로 [허용(Allow)] 버튼을 누르면 권한 승인이 완료됩니다!',
      ],
      isWarning: true,
      tip: '이 경고는 구글 마켓플레이스에 공식 등록되지 않은 개인 작성 스크립트일 때 구글이 띄우는 정상적인 표준 보안 알림입니다.',
    },
    {
      num: 6,
      title: '배포 완료 & 웹 앱 참가 신청 링크 획득!',
      summary: '생성된 웹 앱 URL을 복사하여 사내 슬랙, 메일, 카카오톡 등에 배포합니다.',
      details: [
        '배포가 완료되면 화면에 [웹 앱 URL] (https://script.google.com/macros/s/.../exec)이 생성됩니다.',
        '[복사] 버튼을 눌러 이 링크를 저장합니다.',
        '새 시크릿 창(또는 스마트폰)에서 링크를 열어 테스트 신청을 1건 넣어봅니다.',
        '스프레드시트에 실시간으로 행이 잘 쌓이고, 지메일로 참가 확정 메일이 즉시 수신되는지 확인하면 끝!',
      ],
      tip: '코드를 수정한 뒤 다시 배포할 때는 [배포] → [배포 관리] → 연필 아이콘 ✏️ → 버전을 [새 버전]으로 변경 후 배포해야 수정 사항이 반영됩니다.',
    },
  ];

  const progressPercentage = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                초보자도 3분 만에 끝내는 구글 Apps Script 웹앱 배포 가이드
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              코딩을 전혀 몰라도 순서대로 따라 하면 즉시 동작하는 전용 참가자 모집 링크를 얻을 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToCode}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>복사용 코드 보러가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>배포 단계 체크리스트 ({completedSteps.length} / {steps.length} 완료)</span>
            <span className="font-mono text-indigo-300 font-semibold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-750">
            <div
              className="bg-indigo-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isDone = completedSteps.includes(step.num);
          return (
            <div
              key={step.num}
              className={`rounded-2xl border transition-all ${
                isDone
                  ? 'bg-slate-900/60 border-indigo-900/40 opacity-90'
                  : 'bg-slate-900 border-slate-800'
              } ${step.isWarning ? 'ring-1 ring-amber-500/30' : ''}`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox / Step Badge */}
                    <button
                      onClick={() => toggleStep(step.num)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors cursor-pointer mt-0.5 ${
                        isDone
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step.num}
                    </button>

                    <div>
                      <h3 className={`text-base font-bold text-white flex items-center gap-2 ${isDone ? 'line-through text-slate-400' : ''}`}>
                        <span>{step.title}</span>
                        {step.isWarning && (
                          <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            가장 많이 질문하는 단계
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {step.summary}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep(step.num)}
                    className="text-xs text-slate-400 hover:text-white shrink-0 cursor-pointer hidden sm:block"
                  >
                    {isDone ? '완료 취소' : '완료 표시'}
                  </button>
                </div>

                {/* Detailed Instructions */}
                <div className="mt-4 pl-10 space-y-2 text-xs sm:text-sm text-slate-300">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span className="leading-relaxed">{detail}</span>
                    </div>
                  ))}

                  {/* Step Tip Callout */}
                  {step.tip && (
                    <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold shrink-0">💡 TIP:</span>
                      <span className="leading-relaxed">{step.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            자주 묻는 질문 (FAQ) &amp; 실무 트러블슈팅
          </h3>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 bg-slate-850/60 border border-slate-800 rounded-xl">
            <h4 className="font-semibold text-white mb-1">
              Q. 코드를 수정했는데 참가 신청 링크에서 수정된 내용이 안 보여요!
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Apps Script는 코드를 수정하고 저장(Ctrl+S)하는 것만으로는 웹앱 링크에 반영되지 않습니다.
              상단 <strong className="text-slate-200">[배포] → [배포 관리]</strong>를 누르고, 우측 상단 연필 아이콘 ✏️을 클릭한 뒤, 버전 드롭다운을 <strong>[새 버전]</strong>으로 변경하고 [배포]를 눌러야 최신 수정 사항이 적용됩니다.
            </p>
          </div>

          <div className="p-4 bg-slate-850/60 border border-slate-800 rounded-xl">
            <h4 className="font-semibold text-white mb-1">
              Q. 지메일 발송 횟수 제한(Quota)이 있나요?
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              일반 구글 무료 계정(@gmail.com)은 <strong>하루 최대 100통</strong>, 구글 워크스페이스 사내 계정(@company.com)은 <strong>하루 최대 1,500통</strong>까지 이메일을 자동 발송할 수 있습니다. 일반적인 사내 세미나나 원데이 클래스 정원(30~100명)에는 넉넉하게 운영하실 수 있습니다.
            </p>
          </div>

          <div className="p-4 bg-slate-850/60 border border-slate-800 rounded-xl">
            <h4 className="font-semibold text-white mb-1">
              Q. 참가자가 신청할 때 구글 로그인을 요구하지 않게 하려면 어떻게 하나요?
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              배포 시 [새 배포] 창에서 <strong>'액세스 권한이 있는 사용자'</strong> 옵션을 반드시 <strong>'모든 사용자(Anyone)'</strong>로 설정해야 합니다. '나만'이나 '도메인 내 사용자'로 설정하면 로그인 창이 뜹니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
