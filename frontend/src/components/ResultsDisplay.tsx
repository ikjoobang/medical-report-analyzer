import React from 'react';
import { 
  FileText, 
  Download, 
  User, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  FileDown
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
        {/* Patient Info */}
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

        {/* Exam Info */}
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
      {/* AI Expert Interpretation */}
      {result.aiInterpretation && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 
                        dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg theme-transition border-2 
                        border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">AI 전문가 해석</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span>진단 근거 설명</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.aiInterpretation.whyThisDiagnosis}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>위험 요인 분석</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.aiInterpretation.riskFactors}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span>생활 습관 권장사항</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.aiInterpretation.preventionAdvice}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span>
                <span>진행 위험도</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.aiInterpretation.progressionRisk}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <span>긴급도 설명</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.aiInterpretation.urgencyExplanation}
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>중요:</strong> 이 분석 결과는 AI에 의해 생성된 참고 자료이며, 전문 의료인의 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 의료 전문가와 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};




