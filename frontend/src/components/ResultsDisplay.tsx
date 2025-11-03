import React from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  FileDown,
  Clipboard,
  TestTube,
  Hospital,
  FileCheck,
  Stethoscope
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { exportToText, exportToExcel, exportToPDF } from '../utils/export';

interface ResultsDisplayProps {
  result: AnalysisResult;
  fileName: string;
}

const getSeverityColor = (severity: string) => {
  const colors = {
    '정상': 'bg-severity-normal text-white',
    '경증': 'bg-severity-mild text-black',
    '중등도': 'bg-severity-moderate text-white',
    '중증': 'bg-severity-severe text-white',
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-500 text-white';
};

const getSeverityIcon = (severity: string) => {
  if (severity === '정상') return <CheckCircle size={20} />;
  if (severity === '경증') return <AlertTriangle size={20} />;
  return <AlertTriangle size={20} />;
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, fileName }) => {
  const handleExport = (format: 'text' | 'excel' | 'pdf') => {
    const baseFileName = fileName.replace(/\.[^/.]+$/, '');
    
    switch (format) {
      case 'text':
        exportToText(result, baseFileName);
        break;
      case 'excel':
        exportToExcel(result, baseFileName);
        break;
      case 'pdf':
        exportToPDF(result, baseFileName);
        break;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 fade-in">
      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-end">
        <button
          onClick={() => handleExport('text')}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 dark:bg-primary-dark 
                     dark:hover:bg-primary-dark/90 text-white rounded-lg font-medium transition-all 
                     hover:scale-105 active:scale-95 shadow-md"
        >
          <FileText size={20} />
          <span>텍스트</span>
        </button>
        <button
          onClick={() => handleExport('excel')}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white 
                     rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <FileSpreadsheet size={20} />
          <span>Excel</span>
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white 
                     rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <FileDown size={20} />
          <span>PDF</span>
        </button>
      </div>

      {/* Overall Severity Badge */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold ${getSeverityColor(result.impression.overallSeverity)}`}>
          {getSeverityIcon(result.impression.overallSeverity)}
          <span>전체 심각도: {result.impression.overallSeverity}</span>
        </div>
      </div>

      {/* Patient & Exam Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-primary dark:text-primary-dark" size={24} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">환자 정보</h2>
          </div>
          <div className="space-y-3">
            {result.patientInfo.patientId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">환자 ID</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.patientInfo.patientId}</span>
              </div>
            )}
            {result.patientInfo.name && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">성명</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.patientInfo.name}</span>
              </div>
            )}
            {result.patientInfo.age && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">나이</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.patientInfo.age}</span>
              </div>
            )}
            {result.patientInfo.gender && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">성별</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.patientInfo.gender}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary dark:text-primary-dark" size={24} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">검사 정보</h2>
          </div>
          <div className="space-y-3">
            {result.examInfo.examType && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">검사 종류</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.examInfo.examType}</span>
              </div>
            )}
            {result.examInfo.examPart && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">검사 부위</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.examInfo.examPart}</span>
              </div>
            )}
            {result.examInfo.examDate && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">검사 날짜</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.examInfo.examDate}</span>
              </div>
            )}
            {result.examInfo.hospital && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">병원명</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{result.examInfo.hospital}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disease Codes Section - NEW */}
      {result.diseaseCodes && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg theme-transition">
          <div className="flex items-center gap-3 mb-6">
            <Clipboard className="text-blue-600 dark:text-blue-400" size={28} />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">병명 코드 (ICD-10)</h2>
          </div>

          {/* Confirmed Codes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              확실한 병명 (2개)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.diseaseCodes.confirmed.map((code, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{code.code}</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      {code.confidence}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{code.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{code.englishName}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{code.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Codes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-yellow-600" size={20} />
              추천 병명 (2개)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.diseaseCodes.recommended.map((code, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{code.code}</span>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold">
                      {code.confidence}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{code.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{code.englishName}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{code.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Disease Details - NEW */}
      {result.confirmedDiseaseDetails && result.confirmedDiseaseDetails.map((detail, diseaseIndex) => (
        <div key={diseaseIndex} className="space-y-6">
          {/* Disease Title */}
          <div className="bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark rounded-2xl p-6 shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">{detail.diseaseName}</h2>
            <p className="text-lg opacity-90">ICD-10 코드: {detail.icdCode}</p>
          </div>

          {/* Additional Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
            <div className="flex items-center gap-3 mb-6">
              <TestTube className="text-purple-600 dark:text-purple-400" size={28} />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">필수 추가 검사</h3>
            </div>

            {/* Imaging Tests */}
            {detail.additionalTests.imaging.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Activity size={20} className="text-purple-600" />
                  영상 검사
                </h4>
                <div className="space-y-3">
                  {detail.additionalTests.imaging.map((test, idx) => (
                    <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">{test.testName}</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>목적:</strong> {test.purpose}</p>
                        <p><strong>이유:</strong> {test.reason}</p>
                        <p><strong>예상 소견:</strong> {test.expectedFindings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blood Tests */}
            {detail.additionalTests.bloodTests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <TestTube size={20} className="text-red-600" />
                  혈액 검사
                </h4>
                <div className="space-y-3">
                  {detail.additionalTests.bloodTests.map((test, idx) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-red-900 dark:text-red-200 mb-2">{test.testName}</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>목적:</strong> {test.purpose}</p>
                        <p><strong>이유:</strong> {test.reason}</p>
                        <p><strong>예상 결과:</strong> {test.expectedFindings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Functional Tests */}
            {detail.additionalTests.functionalTests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-blue-600" />
                  기능 검사
                </h4>
                <div className="space-y-3">
                  {detail.additionalTests.functionalTests.map((test, idx) => (
                    <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">{test.testName}</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>목적:</strong> {test.purpose}</p>
                        <p><strong>이유:</strong> {test.reason}</p>
                        <p><strong>예상 결과:</strong> {test.expectedFindings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biopsy Tests */}
            {detail.additionalTests.biopsyTests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileCheck size={20} className="text-orange-600" />
                  조직 검사
                </h4>
                <div className="space-y-3">
                  {detail.additionalTests.biopsyTests.map((test, idx) => (
                    <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">{test.testName}</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>목적:</strong> {test.purpose}</p>
                        <p><strong>이유:</strong> {test.reason}</p>
                        <p><strong>예상 소견:</strong> {test.expectedFindings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Tests */}
            {detail.additionalTests.otherTests.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-gray-600" />
                  기타 검사
                </h4>
                <div className="space-y-3">
                  {detail.additionalTests.otherTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">{test.testName}</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>목적:</strong> {test.purpose}</p>
                        <p><strong>이유:</strong> {test.reason}</p>
                        <p><strong>예상 결과:</strong> {test.expectedFindings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clinic Preparation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="text-green-600 dark:text-green-400" size={28} />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">일반병원 준비사항</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">준비 항목</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {detail.clinicPreparation.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">필요 서류</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {detail.clinicPreparation.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">주의사항</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {detail.clinicPreparation.precautions.map((precaution, idx) => (
                    <li key={idx}>{precaution}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* University Hospital Strategy */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 shadow-lg theme-transition">
            <div className="flex items-center gap-3 mb-4">
              <Hospital className="text-indigo-600 dark:text-indigo-400" size={28} />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">대학병원 방문 전략</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">방문 진료과</h4>
                <p className="text-gray-700 dark:text-gray-300">{detail.universityHospitalStrategy.department}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">방문 목적</h4>
                <p className="text-gray-700 dark:text-gray-300">{detail.universityHospitalStrategy.purpose}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">필요 서류</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {detail.universityHospitalStrategy.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">예상 진료 절차</h4>
                <p className="text-gray-700 dark:text-gray-300">{detail.universityHospitalStrategy.expectedProcedure}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">보험 관련 팁</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {detail.universityHospitalStrategy.insuranceTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Impression */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-primary dark:text-primary-dark" size={24} />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">판독 의견</h2>
        </div>
        <div className="space-y-4">
          {result.impression.diagnosis && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">진단명</h3>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{result.impression.diagnosis}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">판독 요약</h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{result.impression.summary}</p>
          </div>
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">상세 소견</h2>
        <div className="space-y-4">
          {result.findings.map((finding, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary 
                         dark:hover:border-primary-dark transition-colors theme-transition"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{finding.category}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{finding.description}</p>
              <div className="mt-2 flex items-center gap-2">
                {finding.isNormal ? (
                  <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle size={16} /> 정상 범위
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400 text-sm flex items-center gap-1">
                    <AlertTriangle size={16} /> 이상 소견
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Terms */}
      {result.medicalTerms.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg theme-transition">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">의학 용어 설명</h2>
          <div className="space-y-3">
            {result.medicalTerms.map((term, index) => (
              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">{term.term}</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">{term.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary-dark/10 
                      dark:to-secondary-dark/10 rounded-2xl p-6 shadow-lg theme-transition">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">권장 조치사항</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-gray-400 font-medium">긴급도:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              result.recommendations.urgency === '높음' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : result.recommendations.urgency === '중간'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            }`}>
              {result.recommendations.urgency}
            </span>
          </div>
          {result.recommendations.followUp && (
            <div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">후속 조치: </span>
              <span className="text-gray-800 dark:text-gray-200">{result.recommendations.followUp}</span>
            </div>
          )}
          {result.recommendations.department && (
            <div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">추천 진료과: </span>
              <span className="text-gray-800 dark:text-gray-200">{result.recommendations.department}</span>
            </div>
          )}
          {result.recommendations.notes && (
            <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium block mb-1">주의사항:</span>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{result.recommendations.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>개인 연구 목적:</strong> 이 분석 결과는 AI에 의해 생성된 개인 연구/참고 자료입니다. 
          의료 진단이나 보험 청구 목적으로 사용될 수 없으며, 정확한 진단은 반드시 의료 전문가와 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};
