export interface PatientInfo {
  patientId: string;
  name: string;
  age: string;
  gender: string;
  birthDate: string;
}

export interface ExamInfo {
  examType: string;
  examPart: string;
  examDate: string;
  hospital: string;
  referringPhysician: string;
  readingPhysician: string;
}

export interface Finding {
  category: string;
  description: string;
  isNormal: boolean;
  severity: '정상' | '경증' | '중등도' | '중증';
}

export interface Impression {
  summary: string;
  diagnosis: string;
  overallSeverity: '정상' | '경증' | '중등도' | '중증';
}

export interface MedicalTerm {
  term: string;
  explanation: string;
}

export interface Recommendations {
  followUp: string;
  department: string;
  urgency: '낮음' | '중간' | '높음';
  notes: string;
}

export interface AnalysisResult {
  patientInfo: PatientInfo;
  examInfo: ExamInfo;
  findings: Finding[];
  impression: Impression;
  medicalTerms: MedicalTerm[];
  recommendations: Recommendations;
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisResult;
  metadata: {
    fileName: string;
    fileSize: number;
    analyzedAt: string;
    model: string;
  };
}

export interface HistoryItem {
  id: string;
  fileName: string;
  analyzedAt: string;
  result: AnalysisResult;
  thumbnail?: string;
}
