import React from 'react';
import axios from 'axios';
import { AnalysisResult } from '../types';
import './ResultsDisplay.css';

interface Props {
  results: AnalysisResult;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const ResultsDisplay: React.FC<Props> = ({ results }) => {
  
  const downloadPDF = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/generate-pdf`,
        { analysisResult: results },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Medical_Report_${results.patientInfo.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF 다운로드 에러:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'priority-high';
      case 'MODERATE': return 'priority-moderate';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '높음';
      case 'MODERATE': return '중간';
      case 'LOW': return '낮음';
      default: return priority;
    }
  };

  return (
    <div className="results-container">
      
      {/* AI 분석 배너 */}
      <div className="ai-disclaimer-banner">
        <h2>🤖 AI 보조 분석 결과</h2>
        <p>이 시스템은 병원 방문 전 준비를 돕는 보조 도구입니다</p>
      </div>

      {/* 환자 정보 */}
      <section className="info-section patient-info">
        <h2 className="section-main-title">👤 환자 정보</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">이름:</span>
            <span className="value">{results.patientInfo.name}</span>
          </div>
          <div className="info-item">
            <span className="label">환자번호:</span>
            <span className="value">{results.patientInfo.patientId}</span>
          </div>
          {results.patientInfo.age && (
            <div className="info-item">
              <span className="label">나이:</span>
              <span className="value">{results.patientInfo.age}</span>
            </div>
          )}
          {results.patientInfo.gender && (
            <div className="info-item">
              <span className="label">성별:</span>
              <span className="value">{results.patientInfo.gender}</span>
            </div>
          )}
        </div>
      </section>

      {/* 검사 정보 */}
      <section className="info-section exam-info">
        <h2 className="section-main-title">🏥 검사 정보</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">검사일:</span>
            <span className="value">{results.examInfo.examDate}</span>
          </div>
          <div className="info-item">
            <span className="label">검사 종류:</span>
            <span className="value">{results.examInfo.examType}</span>
          </div>
          {results.examInfo.institution && (
            <div className="info-item">
              <span className="label">검사 기관:</span>
              <span className="value">{results.examInfo.institution}</span>
            </div>
          )}
        </div>
      </section>

      {/* AI 관찰 주요 소견 */}
      <section className="disease-codes-section">
        <h2 className="section-main-title">🔬 AI 관찰 주요 소견</h2>
        
        <div className="reference-note">
          <strong>출처:</strong> ICD-10 WHO 국제질병분류 / GPT-4o Vision API / 대한의학회 진단 기준
        </div>

        {/* Primary 소견 */}
        {results.diseaseCodes.primary.length > 0 && (
          <div className="primary-findings">
            <h3 className="findings-title section-main-title">우선순위 높음 - 전문의 상담 권장</h3>
            
            {results.diseaseCodes.primary.map((disease, idx) => (
              <div key={idx} className={`disease-card ${getPriorityColor(disease.priority)}`}>
                <div className="disease-header">
                  <div className="disease-title">
                    <span className="icd-code section-main-title">{disease.code}</span>
                    <span className="disease-name section-main-title">{disease.name}</span>
                  </div>
                  <span className={`priority-badge ${getPriorityColor(disease.priority)}`}>
                    {getPriorityLabel(disease.priority)}
                  </span>
                </div>

                <div className="disease-english">
                  {disease.englishName}
                </div>

                <div className="disease-description">
                  <p>{disease.description}</p>
                </div>

                <div className="observed-features">
                  <h4 className="section-main-title">영상에서 관찰된 특징:</h4>
                  <ul>
                    {disease.observedFeatures.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="references">
                  <h4 className="section-main-title">참조 기준:</h4>
                  <ul>
                    {disease.references.map((ref, i) => (
                      <li key={i}>📚 {ref}</li>
                    ))}
                  </ul>
                </div>

                <div className="next-steps">
                  <h4>💡 다음 단계:</h4>
                  <ul>
                    {disease.nextSteps.map((step, i) => (
                      <li key={i}>→ {step}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-warning">
                  ⚠️ 주의: 이는 AI의 예비 관찰이며,<br/>
                  실제 진단은 영상의학과 전문의의 공식 판독이 필요합니다.
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Secondary 소견 */}
        {results.diseaseCodes.secondary.length > 0 && (
          <div className="secondary-findings">
            <h3 className="findings-title section-main-title">추가 확인 필요</h3>
            
            {results.diseaseCodes.secondary.map((disease, idx) => (
              <div key={idx} className={`disease-card ${getPriorityColor(disease.priority)}`}>
                <div className="disease-header">
                  <div className="disease-title">
                    <span className="icd-code section-main-title">{disease.code}</span>
                    <span className="disease-name section-main-title">{disease.name}</span>
                  </div>
                  <span className={`priority-badge ${getPriorityColor(disease.priority)}`}>
                    {getPriorityLabel(disease.priority)}
                  </span>
                </div>

                <div className="disease-english">
                  {disease.englishName}
                </div>

                <div className="disease-description">
                  <p>{disease.description}</p>
                </div>

                <div className="observed-features">
                  <h4>관찰된 특징:</h4>
                  <ul>
                    {disease.observedFeatures.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 일반병원 방문 전략 */}
      <section className="clinic-strategy-section">
        <h2 className="section-main-title">🏥 일반병원 방문 시 권장 검사</h2>
        <p className="section-subtitle">AI 분석 결과 기반 맞춤 검사 계획</p>

        {results.recommendations.clinicStrategy.requiredTests.map((category, idx) => (
          <div key={idx} className="test-category">
            <h3>{category.category}</h3>
            
            {category.tests.map((test, i) => (
              <div key={i} className="test-item">
                <div className="test-header">
                  <h4>{test.name}</h4>
                  <span className="test-priority">{test.priority}</span>
                </div>
                <p className="test-english">{test.englishName}</p>
                
                <div className="test-details">
                  <div className="detail-row">
                    <span className="detail-label">이유:</span>
                    <span className="detail-value">{test.reason}</span>
                  </div>
                  
                  {test.fastingRequired && (
                    <div className="detail-row fasting">
                      <span className="detail-label">⚠️ 공복:</span>
                      <span className="detail-value">{test.fastingHours}시간 금식 필요</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">💰 예상 비용:</span>
                    <span className="detail-value">{test.estimatedCost}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">⏰ 소요 시간:</span>
                    <span className="detail-value">{test.timeRequired}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* 준비물 체크리스트 */}
        <div className="preparation-checklist">
          <h3>📋 준비물 체크리스트</h3>
          <div className="checklist-grid">
            {results.recommendations.clinicStrategy.preparationChecklist.map((item, idx) => (
              <div key={idx} className="checklist-item">
                <div className="checklist-header">
                  <span className="checklist-checkbox">□</span>
                  <span className="checklist-title">{item.item}</span>
                  <span className={`importance-badge ${item.importance === '필수' ? 'required' : 'optional'}`}>
                    {item.importance}
                  </span>
                </div>
                <p className="checklist-reason">{item.reason}</p>
                <p className="checklist-howto">방법: {item.howToGet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 타임라인 */}
        <div className="timeline">
          <h3>📅 진료 순서 타임라인</h3>
          <div className="timeline-items">
            {results.recommendations.clinicStrategy.timeline.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-day">{item.day || item.week}</div>
                <div className="timeline-content">
                  <h4>{item.action}</h4>
                  {item.details && <p>{item.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 비용 요약 */}
        <div className="cost-summary">
          <h3>💰 비용 정리</h3>
          <div className="cost-table">
            <div className="cost-row">
              <span className="cost-label">필수 검사:</span>
              <span className="cost-value">{results.recommendations.clinicStrategy.costSummary.required}</span>
            </div>
            <div className="cost-row">
              <span className="cost-label">추가 권장:</span>
              <span className="cost-value">{results.recommendations.clinicStrategy.costSummary.additional}</span>
            </div>
            <div className="cost-row total">
              <span className="cost-label">총 예상:</span>
              <span className="cost-value">{results.recommendations.clinicStrategy.costSummary.total}</span>
            </div>
            <div className="cost-row insurance">
              <span className="cost-label">보험 적용 시:</span>
              <span className="cost-value">{results.recommendations.clinicStrategy.costSummary.withInsurance}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 대학병원 방문 전략 */}
      <section className="university-strategy-section">
        <h2 className="section-main-title">🏛️ 대학병원 방문 전략</h2>

        {/* 언제 가야 하나 */}
        <div className="when-to-go">
          <h3>📌 이런 경우 대학병원 방문 권장:</h3>
          <ul>
            {results.recommendations.universityHospitalStrategy.whenToGo.map((when, idx) => (
              <li key={idx}>✓ {when}</li>
            ))}
          </ul>
        </div>

        {/* 추가 서류 */}
        <div className="additional-documents">
          <h3 className="section-main-title">📄 확진을 위해 추가로 준비할 자료</h3>
          {results.recommendations.universityHospitalStrategy.additionalDocuments.map((doc, idx) => (
            <div key={idx} className={`document-card ${doc.importance === '매우 중요' ? 'important' : ''}`}>
              <div className="document-header">
                <h4>{doc.document}</h4>
                <span className="importance-tag">{doc.importance}</span>
              </div>
              <p className="document-reason"><strong>왜 필요?</strong> {doc.reason}</p>
              <p className="document-howto"><strong>어떻게?</strong> {doc.howToGet}</p>
              {doc.template && (
                <div className="document-template">
                  <strong>작성 예시:</strong>
                  <p>"{doc.template}"</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 교수에게 물어볼 질문 */}
        <div className="questions-section">
          <h3 className="section-main-title">❓ 교수에게 꼭 물어볼 질문</h3>
          <ol className="questions-list">
            {results.recommendations.universityHospitalStrategy.questionsToAsk.map((question, idx) => (
              <li key={idx}>{question}</li>
            ))}
          </ol>
        </div>

        {/* 보험 팁 */}
        <div className="insurance-tips">
          <h3 className="section-main-title">💡 보험 관련 핵심 팁</h3>
          {results.recommendations.universityHospitalStrategy.insuranceTips.map((tip, idx) => (
            <div key={idx} className="tip-card">
              <div className="tip-title">✓ {tip.tip}</div>
              <div className="tip-benefit">혜택: {tip.benefit}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 의학 용어 설명 */}
      <section className="medical-terms-section">
        <h2 className="section-main-title">📖 의학 용어 쉬운 설명</h2>
        
        {results.medicalTerms.map((term, idx) => (
          <div key={idx} className="term-card">
            <div className="term-header">
              <h3>{term.term}</h3>
              <span className="korean-badge">{term.koreanTerm}</span>
            </div>
            
            <div className="term-body">
              <div className="korean-name">
                <strong className="section-main-title">한글 정식 명칭:</strong> {term.koreanName}
              </div>
              
              <div className="simple-explanation">
                <strong className="section-main-title">🔍 쉬운 설명:</strong>
                <p>{term.simpleExplanation}</p>
              </div>
              
              {term.detailedExplanation && (
                <div className="detailed-explanation">
                  <p>{term.detailedExplanation}</p>
                </div>
              )}
              
              {term.analogy && (
                <div className="analogy">
                  <strong className="section-main-title">💡 비유:</strong>
                  <p>{term.analogy}</p>
                </div>
              )}
              
              {term.patientContext && (
                <div className="patient-context">
                  <strong className="section-main-title">👤 환자분의 경우:</strong>
                  <p>{term.patientContext}</p>
                </div>
              )}
              
              {term.whatToDo && (
                <div className="action">
                  <strong className="section-main-title">✅ 해야 할 일:</strong>
                  <p>{term.whatToDo}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* 면책 조항 */}
      <section className="disclaimer-section">
        <div className="disclaimer-box">
          <h2>⚠️ 중요 고지사항</h2>
          <div className="disclaimer-content">
            {results.disclaimer.korean.split('\\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      {/* PDF 다운로드 버튼 */}
      <div className="action-buttons">
        <button onClick={downloadPDF} className="download-pdf-btn">
          📄 영문 진단서 다운로드 (PDF)
        </button>
      </div>
    </div>
  );
};
