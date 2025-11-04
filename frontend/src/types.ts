// 환자 정보
export interface PatientInfo {
  name: string;
  patientId: string;
  age?: string;
  gender?: string;
  birthDate?: string;
}

// 검사 정보
export interface ExamInfo {
  examDate: string;
  examType: string;
  institution?: string;
  modality?: string;
  referringPhysician?: string;
  readingPhysician?: string;
}

// 질병 코드
export interface DiseaseCode {
  code: string;
  name: string;
  englishName: string;
  description: string;
  priority: 'HIGH' | 'MODERATE' | 'LOW';
  observedFeatures: string[];
  references: string[];
  nextSteps: string[];
}

export interface DiseaseCodes {
  primary: DiseaseCode[];
  secondary: DiseaseCode[];
}

// 의학 용어
export interface MedicalTerm {
  term: string;
  koreanTerm: string;
  koreanName: string;
  simpleExplanation: string;
  detailedExplanation: string;
  patientContext?: string;
  whatToDo?: string;
  analogy?: string;
}

// 검사 항목
export interface TestItem {
  name: string;
  englishName: string;
  reason: string;
  fastingRequired?: boolean;
  fastingHours?: number;
  estimatedCost: string;
  insuranceCovered?: boolean;
  timeRequired: string;
  priority: string;
}

export interface TestCategory {
  category: string;
  tests: TestItem[];
}

// 준비물 체크리스트
export interface PreparationItem {
  item: string;
  importance: string;
  reason: string;
  howToGet: string;
}

// 타임라인
export interface TimelineItem {
  day?: string;
  week?: string;
  action: string;
  details?: string;
}

// 비용 요약
export interface CostSummary {
  required: string;
  additional: string;
  total: string;
  withInsurance: string;
}

// 일반병원 전략
export interface ClinicStrategy {
  requiredTests: TestCategory[];
  preparationChecklist: PreparationItem[];
  timeline: TimelineItem[];
  costSummary: CostSummary;
}

// 진료과 정보
export interface DepartmentInfo {
  department: string;
  priority: string;
  reason: string;
}

// 병원 정보
export interface HospitalInfo {
  name: string;
  specialty: string;
}

// 추가 서류
export interface AdditionalDocument {
  document: string;
  importance: string;
  reason: string;
  howToGet: string;
  template?: string;
}

// 추가 검사
export interface AdditionalTest {
  name: string;
  englishName: string;
  when: string;
  cost: string;
  insuranceCovered: boolean;
  invasive?: boolean;
}

// 보험 팁
export interface InsuranceTip {
  tip: string;
  benefit: string;
}

// 대학병원 전략
export interface UniversityHospitalStrategy {
  whenToGo: string[];
  recommendedDepartments: DepartmentInfo[];
  recommendedHospitals: HospitalInfo[];
  additionalDocuments: AdditionalDocument[];
  expectedAdditionalTests: AdditionalTest[];
  questionsToAsk: string[];
  insuranceTips: InsuranceTip[];
  timeline: TimelineItem[];
}

// 권장 사항
export interface Recommendations {
  clinicStrategy: ClinicStrategy;
  universityHospitalStrategy: UniversityHospitalStrategy;
}

// 면책 조항
export interface Disclaimer {
  korean: string;
  english: string;
}

// 전체 분석 결과
export interface AnalysisResult {
  patientInfo: PatientInfo;
  examInfo: ExamInfo;
  findings: string;
  impression: string;
  diseaseCodes: DiseaseCodes;
  medicalTerms: MedicalTerm[];
  recommendations: Recommendations;
  disclaimer: Disclaimer;
}
