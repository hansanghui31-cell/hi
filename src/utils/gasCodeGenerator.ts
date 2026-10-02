import { SeminarConfig } from '../types';

export function generateGasCode(config: SeminarConfig): string {
  const prepItemsJs = JSON.stringify(config.preparationItems, null, 2);
  const targetId = (config.spreadsheetId || '').trim();
  const tabName = config.sheetTabName || '참가자명단';

  return `/**
 * ====================================================================
 * [Google Apps Script] 구글 스프레드시트 100% 자동 연결 & 참가 신청 센터
 * ====================================================================
 * 행사명: ${config.title}
 * 주최: ${config.organizer}
 * 
 * [구글 시트 자동 연결 안내]
 * 1. 구글 시트 메뉴 [확장 프로그램] -> [Apps Script]로 들어오셨다면
 *    아래 SPREADSHEET_ID를 빈칸('')으로 두셔도 현재 시트와 자동으로 100% 연결됩니다!
 * 2. 외부 특정 시트와 연결하고 싶으실 경우 SPREADSHEET_ID에 시트 ID를 입력하시면 됩니다.
 * ====================================================================
 */

// ====================================================================
// [1] 구글 스프레드시트 연동 설정 (필요시 수정)
// ====================================================================
// ※ 시트에서 [확장 프로그램] -> [Apps Script]로 열었다면 빈 문자열('')로 두면 자동 연결됩니다.
// ※ 특정 시트와 직접 연결하려면 구글 시트 URL의 /d/ 와 /edit 사이의 ID를 입력하세요.
var SPREADSHEET_ID = '${targetId}'; 

// 참가자 데이터가 저장될 시트 탭 이름 (해당 탭이 없으면 스크립트가 자동 생성해줍니다)
var SHEET_TAB_NAME = '${tabName}';

// ====================================================================
// [2] 웹앱 접속 화면(doGet) 및 외부 Vercel 배포 연동용 API(doPost)
// ====================================================================

// 브라우저에서 직접 링크를 열었을 때 index.html 화면 반환
function doGet(e) {
  // 외부 헬스체크 지원
  if (e && e.parameter && e.parameter.action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', connected: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var htmlOutput = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('${config.title.replace(/'/g, "\\'")} - 참가 신청')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
  return htmlOutput;
}

// 깃허브 / 베셀(Vercel) 등 외부 웹사이트에서 fetch POST 요청을 보낼 때 처리
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '';
    var formData = {};
    if (rawData) {
      try {
        formData = JSON.parse(rawData);
      } catch (jsonErr) {
        formData = e.parameter;
      }
    } else {
      formData = e.parameter;
    }

    var result = processForm(formData);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ====================================================================
// [3] 구글 시트 자동 연결 헬퍼 함수 (자동 감지 & 탭 자동 생성)
// ====================================================================
function getTargetSheet() {
  var ss;
  
  // 1. 특정 스프레드시트 ID가 설정되어 있으면 해당 시트 열기
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (err) {
      Logger.log('지정된 ID로 시트 열기 실패, 활성 시트로 자동 대체합니다: ' + err.toString());
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    // 2. 설정된 ID가 없으면 현재 활성 스프레드시트 자동 연결
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error('연결된 구글 스프레드시트를 찾을 수 없습니다. 시트 메뉴 [확장 프로그램] -> [Apps Script]를 통해 열었는지 확인해주세요.');
  }

  // 지정된 이름의 탭 시트 가져오기 (없으면 자동으로 새 탭 추가)
  var sheet = ss.getSheetByName(SHEET_TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB_NAME);
  }

  return sheet;
}

// ====================================================================
// [4] 참가 신청 폼 데이터 처리 (시트 자동 기록 + 지메일 발송)
// ====================================================================
function processForm(formData) {
  var lock = LockService.getScriptLock();
  // 동시 신청 시 충돌 방지를 위해 최대 30초 대기
  try {
    lock.waitLock(30000);
  } catch (e) {
    return {
      success: false,
      message: '신청자가 몰려 처리가 지연되었습니다. 잠시 후 다시 시도해 주세요.'
    };
  }

  try {
    var name = (formData.name || '').trim();
    var email = (formData.email || '').trim();
    var session = (formData.session || '').trim();
    var question = (formData.question || '').trim();

    // 필수 항목 유효성 검사
    if (!name || !email || !session) {
      throw new Error('이름, 이메일 주소, 세션 선택은 필수 항목입니다.');
    }

    var emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(email)) {
      throw new Error('올바른 이메일 주소 형식을 입력해 주세요.');
    }

    // [핵심] 자동으로 연결된 구글 스프레드시트 가져오기
    var sheet = getTargetSheet();

    // [중요] 1행 헤더 확인 및 없을 경우 자동 생성 & 스타일 적용
    ensureHeaderRow(sheet);

    // 접수 일시 (한국 표준시 KST)
    var timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    var status = '등록완료';

    // 시트 맨 아래에 데이터 추가
    // 컬럼 순서: [접수일시, 이름, 이메일, 선택세션, 사전질문, 등록상태]
    sheet.appendRow([
      timestamp,
      name,
      email,
      session,
      question ? question : '(사전 질문 없음)',
      status
    ]);

    // 마지막 추가된 행 정렬 및 글꼴 깔끔하게 맞춤
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 6)
      .setVerticalAlignment('middle')
      .setFontFamily('Noto Sans KR')
      .setFontSize(10);
    sheet.getRange(lastRow, 1).setHorizontalAlignment('center'); // 접수일시
    sheet.getRange(lastRow, 2).setHorizontalAlignment('center'); // 이름
    sheet.getRange(lastRow, 6).setHorizontalAlignment('center'); // 등록상태

    // 5. 지메일 맞춤형 HTML 확정 안내장 자동 발송
    sendConfirmationEmail(name, email, session, question, timestamp);

    return {
      success: true,
      message: '참가 신청이 확정되었습니다! 입력하신 메일로 입장 안내장을 발송했습니다.',
      data: {
        name: name,
        email: email,
        session: session,
        timestamp: timestamp
      }
    };

  } catch (error) {
    Logger.log('Error in processForm: ' + error.toString());
    return {
      success: false,
      message: error.message || '참가 신청 처리 중 오류가 발생했습니다. 담당자에게 문의해 주세요.'
    };
  } finally {
    lock.releaseLock();
  }
}

// ====================================================================
// [5] 시트 헤더 검사 및 자동 서식 생성
// ====================================================================
function ensureHeaderRow(sheet) {
  var headers = ['접수일시', '이름', '이메일', '선택세션', '사전질문', '등록상태'];
  var needsHeader = false;

  if (sheet.getLastRow() === 0) {
    needsHeader = true;
  } else {
    var firstCell = sheet.getRange(1, 1).getValue();
    if (firstCell !== '접수일시') {
      // 1행에 헤더가 없으면 1행에 새로 삽입
      sheet.insertRowBefore(1);
      needsHeader = true;
    }
  }

  if (needsHeader) {
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#0F172A') // 다크 슬레이트 네이비
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontSize(11)
      .setFontFamily('Noto Sans KR')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setRowHeight(38);

    // 1행 틀 고정 (스크롤 시 헤더 고정)
    sheet.setFrozenRows(1);

    // 컬럼 너비 보기 좋게 기본 조정
    sheet.setColumnWidth(1, 170); // 접수일시
    sheet.setColumnWidth(2, 110); // 이름
    sheet.setColumnWidth(3, 220); // 이메일
    sheet.setColumnWidth(4, 280); // 선택세션
    sheet.setColumnWidth(5, 320); // 사전질문
    sheet.setColumnWidth(6, 100); // 등록상태
  }
}

// ====================================================================
// [6] 지메일 맞춤 확정 안내장 발송 함수
// ====================================================================
function sendConfirmationEmail(name, email, session, question, timestamp) {
  var emailSubject = '[참가 확정] ' + name + '님, 신청하신 세미나 등록이 정상 완료되었습니다.';

  var eventTitle = '${config.title.replace(/'/g, "\\'")}';
  var eventDateTime = '${config.dateTime.replace(/'/g, "\\'")}';
  var eventLocation = '${config.locationAddress.replace(/'/g, "\\'")}';
  var zoomLink = '${config.zoomLink.replace(/'/g, "\\'")}';
  var organizer = '${config.organizer.replace(/'/g, "\\'")}';
  var contactEmail = '${config.contactEmail.replace(/'/g, "\\'")}';
  var contactPhone = '${config.contactPhone.replace(/'/g, "\\'")}';

  var prepItems = ${prepItemsJs};
  var prepListHtml = '';
  for (var i = 0; i < prepItems.length; i++) {
    prepListHtml += '<li style="margin-bottom: 6px; color: #334155;">' + prepItems[i] + '</li>';
  }

  var questionNoticeHtml = question 
    ? '<div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">' +
        '<strong style="color: #1e293b; font-size: 13px;">강사님께 남겨주신 사전 질문:</strong><br>' +
        '<span style="color: #475569; font-size: 14px; line-height: 1.6;">“' + escapeHtml(question) + '”</span>' +
        '<p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">* 질문은 담당 강사님께 전달되어 세미나 질의응답 세션에서 답변드릴 예정입니다.</p>' +
      '</div>'
    : '<div style="background-color: #f8fafc; padding: 10px 14px; margin: 12px 0; border-radius: 4px; font-size: 13px; color: #64748b;">(등록된 사전 질문이 없습니다. 당일 현장 Q&amp;A 시간에도 자유롭게 질문하실 수 있습니다.)</div>';

  var htmlBody = 
    '<!DOCTYPE html>' +
    '<html>' +
    '<head><meta charset="UTF-8"></head>' +
    '<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \\'Apple SD Gothic Neo\\', \\'Malgun Gothic\\', sans-serif;">' +
      '<div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">' +
        
        // 헤더 영역
        '<div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 36px 30px; text-align: left; border-bottom: 3px solid #6366f1;">' +
          '<span style="display: inline-block; font-size: 12px; font-weight: 600; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">' + organizer + '</span>' +
          '<h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.4;">' + eventTitle + '</h1>' +
          '<p style="margin: 10px 0 0 0; font-size: 14px; color: #94a3b8;">' + name + '님의 세미나 참가 신청이 정상 확정되었습니다.</p>' +
        '</div>' +

        // 본문 안내 영역
        '<div style="padding: 30px;">' +
          '<p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-top: 0;">' +
            '안녕하세요, <strong>' + name + '</strong>님!<br>' +
            '본 행사에 관심을 갖고 신청해 주셔서 대단히 감사드립니다.<br>' +
            '아래 신청 내역과 입장 안내 사항을 확인해 주시기 바랍니다.' +
          '</p>' +

          // 신청 정보 요약 박스
          '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr>' +
                '<td style="padding: 8px 0; color: #64748b; width: 100px; font-weight: 600;">참가자 성함</td>' +
                '<td style="padding: 8px 0; color: #0f172a; font-weight: 600;">' + name + ' 님</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 0; color: #64748b; font-weight: 600;">선택 세션</td>' +
                '<td style="padding: 8px 0; color: #4338ca; font-weight: 700;">' + session + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 0; color: #64748b; font-weight: 600;">행사 일시</td>' +
                '<td style="padding: 8px 0; color: #0f172a;">' + eventDateTime + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">오프라인 장소</td>' +
                '<td style="padding: 8px 0; color: #0f172a; line-height: 1.5;">' + eventLocation + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">온라인 줌 링크</td>' +
                '<td style="padding: 8px 0; color: #2563eb;"><a href="' + zoomLink + '" style="color: #2563eb; text-decoration: underline;" target="_blank">' + zoomLink + '</a></td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 0; color: #64748b; font-weight: 600;">접수 완료 일시</td>' +
                '<td style="padding: 8px 0; color: #64748b; font-family: monospace;">' + timestamp + '</td>' +
              '</tr>' +
            '</table>' +
          '</div>' +

          // 사전 질문 안내
          questionNoticeHtml +

          // 필수 준비물 안내
          '<div style="margin-top: 24px;">' +
            '<h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; font-weight: 700;">필수 준비물 &amp; 사전 확인 안내</h3>' +
            '<ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7;">' +
              prepListHtml +
            '</ul>' +
          '</div>' +

          // 문의처 및 서명
          '<div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.6;">' +
            '<strong>' + organizer + ' 운영사무국</strong><br>' +
            '이메일 문의: <a href="mailto:' + contactEmail + '" style="color: #4f46e5;">' + contactEmail + '</a> | 직통전화: ' + contactPhone + '<br>' +
            '<span style="font-size: 11px; color: #94a3b8; display: block; margin-top: 8px;">본 메일은 구글 스프레드시트 및 Apps Script 자동 발송 시스템을 통해 신청 즉시 발송되었습니다.</span>' +
          '</div>' +

        '</div>' +
      '</div>' +
    '</body>' +
    '</html>';

  // 실제 이메일 전송 실행
  GmailApp.sendEmail(email, emailSubject, '', {
    htmlBody: htmlBody,
    name: organizer
  });
}

// ====================================================================
// [7] 초보자를 위한 구글 시트 연결 테스트 함수 (편집기에서 [실행] 클릭 시 동작)
// ====================================================================
function testConnection() {
  try {
    var sheet = getTargetSheet();
    ensureHeaderRow(sheet);
    Logger.log('🎉 구글 스프레드시트 연결 성공!');
    Logger.log('시트 이름: ' + sheet.getParent().getName());
    Logger.log('탭 이름: ' + sheet.getName());
    Logger.log('현재 총 데이터 행 수: ' + sheet.getLastRow());
  } catch (e) {
    Logger.log('❌ 구글 시트 연결 실패: ' + e.toString());
  }
}

// XSS 방지를 위한 HTML 이스케이프 함수
function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
`;
}

export function generateIndexHtml(config: SeminarConfig): string {
  const sessionOptions = config.sessions.map((s, index) => `
          <!-- 세션 카드: ${s.code} -->
          <label class="session-card relative flex items-start p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500/60 transition cursor-pointer">
            <input type="radio" name="session" value="[${s.code}] ${s.title}" class="mt-1 text-indigo-500 focus:ring-indigo-400 focus:ring-offset-slate-900" ${index === 0 ? 'checked' : ''} required />
            <div class="ml-3.5 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-semibold text-white tracking-wide">[${s.code}] ${s.title}</span>
                <span class="text-xs text-indigo-300 font-medium">${s.badge}</span>
              </div>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">${s.description}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>강사: ${s.speaker}</span>
                <span>·</span>
                <span>시간: ${s.time}</span>
              </div>
            </div>
          </label>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} - 참가 신청</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; }
    .session-card:has(input:checked) {
      border-color: #6366f1;
      background-color: rgba(99, 102, 241, 0.08);
      box-shadow: 0 0 0 1px #6366f1;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6">

  <main class="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
    <!-- 헤더 배너 영역 -->
    <header class="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/40 border-b border-slate-800">
      <div class="text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-2">
        ${config.organizer}
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
        ${config.title}
      </h1>
      <p class="text-sm text-slate-400 mt-2 leading-relaxed">
        ${config.subtitle}
      </p>

      <!-- 세미나 메타 정보 -->
      <div class="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
        <div>
          <span class="text-slate-500 block">일시</span>
          <span class="font-medium text-slate-200">${config.dateTime}</span>
        </div>
        <div>
          <span class="text-slate-500 block">장소</span>
          <span class="font-medium text-slate-200">${config.locationAddress}</span>
        </div>
      </div>
    </header>

    <!-- 신청 양식 폼 -->
    <div id="form-container" class="p-6 sm:p-8">
      <form id="registration-form" onsubmit="handleSubmit(event)" class="space-y-6">
        
        <!-- 1. 참가자 이름 -->
        <div>
          <label for="name" class="block text-sm font-semibold text-slate-200 mb-2">
            참가자 성함 <span class="text-rose-400">*</span>
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="홍길동" 
            required 
            class="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
          />
        </div>

        <!-- 2. 참가자 이메일 주소 -->
        <div>
          <label for="email" class="block text-sm font-semibold text-slate-200 mb-2">
            이메일 주소 <span class="text-rose-400">*</span>
            <span class="text-xs font-normal text-slate-400 ml-1">(안내장 및 입장 링크 발송용)</span>
          </label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="example@company.com" 
            required 
            class="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
          />
        </div>

        <!-- 3. 희망 세션 선택 -->
        <div>
          <label class="block text-sm font-semibold text-slate-200 mb-2">
            참석 희망 세션 선택 <span class="text-rose-400">*</span>
          </label>
          <div class="space-y-3">
${sessionOptions}
          </div>
        </div>

        <!-- 4. 강사님께 남기는 사전 질문 (선택 사항) -->
        <div>
          <label for="question" class="block text-sm font-semibold text-slate-200 mb-2">
            강사님께 남기는 사전 질문 <span class="text-xs text-slate-400 font-normal">(선택 사항)</span>
          </label>
          <textarea 
            id="question" 
            name="question" 
            rows="3" 
            placeholder="평소 업무 자동화 시 막혔던 점이나 세미나에서 꼭 듣고 싶은 내용을 자유롭게 적어주세요." 
            class="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm resize-none"
          ></textarea>
        </div>

        <!-- 에러 메시지 알림 박스 (오류 시 표시) -->
        <div id="error-box" class="hidden p-4 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm">
          <p id="error-message"></p>
        </div>

        <!-- 5. 제출 버튼 (로딩 스피너 포함) -->
        <button 
          type="submit" 
          id="submit-btn" 
          class="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span id="btn-text">참가 신청 확정하기</span>
          <!-- 로딩 스피너 아이콘 -->
          <svg id="btn-spinner" class="hidden animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>

        <p class="text-center text-xs text-slate-500">
          제출 즉시 입력하신 이메일로 맞춤 입장 안내 메일이 실시간 자동 발송됩니다.
        </p>
      </form>
    </div>

    <!-- 완료 성공 화면 (제출 완료 후 표시) -->
    <div id="success-container" class="hidden p-8 sm:p-12 text-center">
      <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
        참가 신청이 확정되었습니다!
      </h2>
      <p class="text-indigo-300 font-medium text-sm mb-6">
        입력하신 메일로 입장 안내장을 발송했습니다.
      </p>

      <div class="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 text-left text-xs sm:text-sm text-slate-300 mb-8 space-y-2">
        <div class="flex justify-between pb-2 border-b border-slate-700/60">
          <span class="text-slate-500">신청자</span>
          <span id="result-name" class="font-semibold text-white">-</span>
        </div>
        <div class="flex justify-between pb-2 border-b border-slate-700/60">
          <span class="text-slate-500">안내장 발송 이메일</span>
          <span id="result-email" class="text-indigo-300 font-mono">-</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">선택 세션</span>
          <span id="result-session" class="font-medium text-slate-200 text-right">-</span>
        </div>
      </div>

      <button 
        type="button" 
        onclick="resetForm()" 
        class="text-xs text-slate-400 hover:text-white underline cursor-pointer"
      >
        추가 참가자 신청하기
      </button>
    </div>

    <!-- 푸터 -->
    <footer class="px-6 py-4 bg-slate-950/60 border-t border-slate-800/60 text-center text-xs text-slate-500">
      ${config.organizer} · 문의: ${config.contactEmail}
    </footer>
  </main>

  <script>
    function handleSubmit(event) {
      event.preventDefault();

      var submitBtn = document.getElementById('submit-btn');
      var btnText = document.getElementById('btn-text');
      var btnSpinner = document.getElementById('btn-spinner');
      var errorBox = document.getElementById('error-box');
      var errorMessage = document.getElementById('error-message');

      // 로딩 상태 시작
      submitBtn.disabled = true;
      btnText.textContent = '참가 신청 처리 중...';
      btnSpinner.classList.remove('hidden');
      errorBox.classList.add('hidden');

      var form = document.getElementById('registration-form');
      var formData = {
        name: form.name.value,
        email: form.email.value,
        session: form.session.value,
        question: form.question.value
      };

      // Google Apps Script 환경인 경우 google.script.run 호출
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(response) {
            handleResponse(response, formData);
          })
          .withFailureHandler(function(error) {
            handleError(error.message || '서버 통신 중 오류가 발생했습니다.');
          })
          .processForm(formData);
      } else {
        // GAS 외부 또는 로컬 브라우저 테스트 시뮬레이션
        setTimeout(function() {
          handleResponse({
            success: true,
            message: '참가 신청이 확정되었습니다! 입력하신 메일로 입장 안내장을 발송했습니다.',
            data: formData
          }, formData);
        }, 1200);
      }
    }

    function handleResponse(response, formData) {
      var submitBtn = document.getElementById('submit-btn');
      var btnText = document.getElementById('btn-text');
      var btnSpinner = document.getElementById('btn-spinner');

      submitBtn.disabled = false;
      btnText.textContent = '참가 신청 확정하기';
      btnSpinner.classList.add('hidden');

      if (response && response.success) {
        // 성공 화면 전환
        document.getElementById('form-container').classList.add('hidden');
        document.getElementById('success-container').classList.remove('hidden');

        document.getElementById('result-name').textContent = formData.name;
        document.getElementById('result-email').textContent = formData.email;
        document.getElementById('result-session').textContent = formData.session;
      } else {
        handleError((response && response.message) ? response.message : '신청 처리에 실패했습니다.');
      }
    }

    function handleError(msg) {
      var submitBtn = document.getElementById('submit-btn');
      var btnText = document.getElementById('btn-text');
      var btnSpinner = document.getElementById('btn-spinner');
      var errorBox = document.getElementById('error-box');
      var errorMessage = document.getElementById('error-message');

      submitBtn.disabled = false;
      btnText.textContent = '참가 신청 확정하기';
      btnSpinner.classList.add('hidden');

      errorMessage.textContent = msg;
      errorBox.classList.remove('hidden');
    }

    function resetForm() {
      document.getElementById('registration-form').reset();
      document.getElementById('form-container').classList.remove('hidden');
      document.getElementById('success-container').classList.add('hidden');
      document.getElementById('error-box').classList.add('hidden');
    }
  </script>
</body>
</html>`;
}
