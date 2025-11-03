export interface PatientInfo {
  patientId: string;
  name: string;
  age: string;
  gender: string;
}

export interface ExamInfo {
  examType: string;
  examPart: string;
  examDate: string;
  hospital: string;
}

export interface Finding {
  category: string;
  description: string;
  severity: string;
  isNormal: boolean;
}

export interface Impression {
  diagnosis: string;
  summary: string;
  overallSeverity: string;
}

export interface MedicalTerm {
  term: string;
  explanation: string;
}

export interface Recommendations {
  urgency: string;
  followUp: string;
  department: string;
  notes: string;
}

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

export interface TestDetail {
  testName: string;
  purpose: string;
  reason: string;
  expectedFindings: string;
}

export interface AdditionalTests {
  imaging: TestDetail[];
  bloodTests: TestDetail[];
  functionalTests: TestDetail[];
  biopsyTests: TestDetail[];
  otherTests: TestDetail[];
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
  diseaseCodes: DiseaseCodes;
  confirmedDiseaseDetails: ConfirmedDiseaseDetail[];
  disclaimer?: string;
}
