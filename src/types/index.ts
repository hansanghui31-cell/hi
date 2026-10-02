export interface SeminarSession {
  id: string;
  code: string; // e.g., '세션 A'
  title: string;
  speaker: string;
  time: string;
  description: string;
  badge: string;
}

export interface SeminarConfig {
  title: string;
  subtitle: string;
  organizer: string;
  dateTime: string;
  locationType: 'offline' | 'online' | 'hybrid';
  locationAddress: string;
  zoomLink: string;
  preparationItems: string[];
  contactEmail: string;
  contactPhone: string;
  sessions: SeminarSession[];
  sheetMode: 'active' | 'id';
  spreadsheetId: string;
  sheetTabName: string;
  gasApiUrl: string;
}

export interface RegistrationRecord {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  sessionCode: string;
  sessionTitle: string;
  question: string;
  status: '등록완료' | '안내장발송됨' | '대기중';
}

export type ActiveTab = 'demo' | 'sheet' | 'email' | 'code' | 'guide';
