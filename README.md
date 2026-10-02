# 원데이 클래스 & 사내 세미나 참가 신청 자동화 센터

구글 앱스 스크립트(Google Apps Script) 기반의 실무 세미나 참가 신청 접수, 구글 스프레드시트 실시간 자동 누적, 지메일 맞춤 확정 안내장 자동 발송 원클릭 자동화 솔루션입니다.

---

## 🚀 Vercel(베셀) 배포 가이드 (1분 완성)

이 프로젝트는 Vite + React 기반으로 제작되어 GitHub에 푸시한 후 Vercel에 단 1분 만에 배포할 수 있습니다.

### 1단계: 깃허브(GitHub) 저장소에 푸시하기
로컬 터미널에서 아래 명령어를 순서대로 입력합니다:
```bash
git init
git add .
git commit -m "feat: 세미나 참가 신청 및 GAS 자동화 센터 초기 커밋"
git branch -M main
git remote add origin https://github.com/사용자이름/저장소이름.git
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 가져오기 (Import)
1. [Vercel 공식 웹사이트](https://vercel.com)에 로그인합니다.
2. 대시보드 우측 상단의 **[Add New...] → [Project]**를 클릭합니다.
3. 방금 푸시한 GitHub 저장소를 찾아 **[Import]** 버튼을 클릭합니다.

### 3단계: 빌드 설정 확인 (자동 감지)
* **Framework Preset**: `Vite` (자동 감지됨)
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`
*(※ `vercel.json` 설정 파일이 프로젝트 루트에 포함되어 있어 별도의 설정 변경 없이 바로 배포됩니다.)*

### 4단계: [Deploy] 클릭
파란색 **[Deploy]** 버튼을 누르면 30초 내에 배포가 완료되며 고유 도메인(`https://your-project.vercel.app`)이 발급됩니다.

---

## 🛠️ 주요 기능

1. **실시간 참가 신청창구 라이브 시뮬레이터 (Live Form Demo)**
   * PC 및 모바일 반응형 뷰 지원
   * 세션 선택, 사전 질문 입력, 로딩 스피너 및 성공 알림 화면

2. **구글 스프레드시트 100% 자동 연결 (Google Sheets Auto Sync)**
   * 시트 메뉴 [확장 프로그램] → [Apps Script]를 통한 무설정 자동 바인딩
   * 1행 헤더 자동 감지 및 네이비 서식 자동 생성 (`[접수일시, 이름, 이메일, 선택세션, 사전질문, 등록상태]`)
   * CSV 내보내기 지원

3. **지메일(GmailApp) 맞춤 확정 안내장 발송**
   * 신청자 이름, 선택 세션, 일시, 장소/Zoom 링크, 준비물, 사전 질문 피드백이 담긴 감각적인 반응형 HTML 메일 전송

4. **원클릭 복사용 Apps Script 소스코드 허브**
   * `Code.gs` (서버 로직, 시트 누적, 지메일 발송, doPost/doGet API 내장)
   * `index.html` (Tailwind CSS 기반 반응형 UI)
