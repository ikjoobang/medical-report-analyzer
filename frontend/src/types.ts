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

// New interfaces for disease codes and additional tests
export interface DiseaseCode {
  code: string;
  name: string;
  englishName: string;
  description: string;
  confidence: string;
}

export interface DiseaseCodes {
  confirmed: DiseaseCode[];
  recommended: DiseaseCode[];
}

export interface TestItem {
  testName: string;
  purpose: string;
  reason: string;
  expectedFindings: string;
}

export interface AdditionalTests {
  imaging: TestItem[];
  bloodTests: TestItem[];
  functionalTests: TestItem[];
  biopsyTests: TestItem[];
  otherTests: TestItem[];
}

export interface ClinicPreparation {
  items: string[];
  documents: string[];
  precautions: string[];
}

export interface UniversityHospitalStrategy {
  department: string;
  purpose: string;
  requiredDocuments: string[];
  expectedProcedure: string;
  insuranceTips: string[];
}

export interface ConfirmedDiseaseDetail {
  diseaseName: string;
  icdCode: string;
  additionalTests: AdditionalTests;
  clinicPreparation: ClinicPreparation;
  universityHospitalStrategy: UniversityHospitalStrategy;
}

export interface AnalysisResult {
  patientInfo: PatientInfo;
  examInfo: ExamInfo;
  findings: Finding[];
  impression: Impression;
  medicalTerms: MedicalTerm[];
  recommendations: Recommendations;
  diseaseCodes?: DiseaseCodes;
  confirmedDiseaseDetails?: ConfirmedDiseaseDetail[];
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
