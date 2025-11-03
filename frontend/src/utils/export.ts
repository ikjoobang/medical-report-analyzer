import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AnalysisResult } from '../types';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Export to Text
export const exportToText = (result: AnalysisResult, fileName: string) => {
  let text = '='.repeat(60) + '\n';
  text += '의료 영상 판독 분석 결과\n';
  text += '='.repeat(60) + '\n\n';

  text += '[ 환자 정보 ]\n';
  text += '-'.repeat(60) + '\n';
  if (result.patientInfo.patientId) text += `환자 ID: ${result.patientInfo.patientId}\n`;
  if (result.patientInfo.name) text += `성명: ${result.patientInfo.name}\n`;
  if (result.patientInfo.age) text += `나이: ${result.patientInfo.age}\n`;
  if (result.patientInfo.gender) text += `성별: ${result.patientInfo.gender}\n`;
  if (result.patientInfo.birthDate) text += `생년월일: ${result.patientInfo.birthDate}\n`;
  text += '\n';

  text += '[ 검사 정보 ]\n';
  text += '-'.repeat(60) + '\n';
  if (result.examInfo.examType) text += `검사 종류: ${result.examInfo.examType}\n`;
  if (result.examInfo.examPart) text += `검사 부위: ${result.examInfo.examPart}\n`;
  if (result.examInfo.examDate) text += `검사 날짜: ${result.examInfo.examDate}\n`;
  if (result.examInfo.hospital) text += `병원명: ${result.examInfo.hospital}\n`;
  if (result.examInfo.referringPhysician) text += `의뢰 의사: ${result.examInfo.referringPhysician}\n`;
  if (result.examInfo.readingPhysician) text += `판독 의사: ${result.examInfo.readingPhysician}\n`;
  text += '\n';

  text += '[ 전체 판독 의견 ]\n';
  text += '-'.repeat(60) + '\n';
  text += `심각도: ${result.impression.overallSeverity}\n`;
  if (result.impression.diagnosis) text += `진단명: ${result.impression.diagnosis}\n`;
  text += `판독 요약: ${result.impression.summary}\n`;
  text += '\n';

  text += '[ 상세 소견 ]\n';
  text += '-'.repeat(60) + '\n';
  result.findings.forEach((finding, index) => {
    text += `\n${index + 1}. ${finding.category}\n`;
    text += `   상태: ${finding.isNormal ? '정상' : '이상'} (${finding.severity})\n`;
    text += `   내용: ${finding.description}\n`;
  });
  text += '\n';

  if (result.medicalTerms.length > 0) {
    text += '[ 의학 용어 설명 ]\n';
    text += '-'.repeat(60) + '\n';
    result.medicalTerms.forEach((term, index) => {
      text += `\n${index + 1}. ${term.term}\n`;
      text += `   ${term.explanation}\n`;
    });
    text += '\n';
  }

  text += '[ 권장 조치사항 ]\n';
  text += '-'.repeat(60) + '\n';
  text += `긴급도: ${result.recommendations.urgency}\n`;
  if (result.recommendations.followUp) text += `후속 조치: ${result.recommendations.followUp}\n`;
  if (result.recommendations.department) text += `추천 진료과: ${result.recommendations.department}\n`;
  if (result.recommendations.notes) text += `주의사항: ${result.recommendations.notes}\n`;
  
  text += '\n' + '='.repeat(60) + '\n';
  text += `보고서 생성일: ${new Date().toLocaleString('ko-KR')}\n`;
  text += '='.repeat(60) + '\n';

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_분석결과.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export to Excel
export const exportToExcel = (result: AnalysisResult, fileName: string) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Patient Info
  const patientData = [
    ['항목', '내용'],
    ['환자 ID', result.patientInfo.patientId],
    ['성명', result.patientInfo.name],
    ['나이', result.patientInfo.age],
    ['성별', result.patientInfo.gender],
    ['생년월일', result.patientInfo.birthDate],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(patientData);
  ws1['!cols'] = [{ wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, ws1, '환자정보');

  // Sheet 2: Exam Info
  const examData = [
    ['항목', '내용'],
    ['검사 종류', result.examInfo.examType],
    ['검사 부위', result.examInfo.examPart],
    ['검사 날짜', result.examInfo.examDate],
    ['병원명', result.examInfo.hospital],
    ['의뢰 의사', result.examInfo.referringPhysician],
    ['판독 의사', result.examInfo.readingPhysician],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(examData);
  ws2['!cols'] = [{ wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, ws2, '검사정보');

  // Sheet 3: Findings
  const findingsData = [
    ['번호', '카테고리', '소견 내용', '상태', '심각도'],
    ...result.findings.map((f, i) => [
      i + 1,
      f.category,
      f.description,
      f.isNormal ? '정상' : '이상',
      f.severity
    ])
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(findingsData);
  ws3['!cols'] = [{ wch: 8 }, { wch: 15 }, { wch: 50 }, { wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(workbook, ws3, '상세소견');

  // Sheet 4: Impression
  const impressionData = [
    ['항목', '내용'],
    ['전체 심각도', result.impression.overallSeverity],
    ['진단명', result.impression.diagnosis],
    ['판독 요약', result.impression.summary],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(impressionData);
  ws4['!cols'] = [{ wch: 15 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, ws4, '판독의견');

  // Sheet 5: Medical Terms
  if (result.medicalTerms.length > 0) {
    const termsData = [
      ['번호', '의학 용어', '한글 설명'],
      ...result.medicalTerms.map((t, i) => [i + 1, t.term, t.explanation])
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(termsData);
    ws5['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, ws5, '의학용어');
  }

  // Sheet 6: Recommendations
  const recoData = [
    ['항목', '내용'],
    ['긴급도', result.recommendations.urgency],
    ['후속 조치', result.recommendations.followUp],
    ['추천 진료과', result.recommendations.department],
    ['주의사항', result.recommendations.notes],
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(recoData);
  ws6['!cols'] = [{ wch: 15 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, ws6, '권장조치');

  XLSX.writeFile(workbook, `${fileName}_분석결과.xlsx`);
};

// Export to PDF
export const exportToPDF = (result: AnalysisResult, fileName: string) => {
  const doc = new jsPDF();
  
  // Add Korean font support (using default, might have limited Korean support)
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Medical Report Analysis', 105, yPos, { align: 'center' });
  yPos += 15;

  // Patient Info
  doc.setFontSize(14);
  doc.text('[ Patient Information ]', 20, yPos);
  yPos += 10;
  
  const patientData = [
    ['Patient ID', result.patientInfo.patientId],
    ['Name', result.patientInfo.name],
    ['Age', result.patientInfo.age],
    ['Gender', result.patientInfo.gender],
    ['Birth Date', result.patientInfo.birthDate],
  ].filter(row => row[1]); // Filter out empty values

  doc.autoTable({
    startY: yPos,
    head: [['Field', 'Value']],
    body: patientData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [8, 145, 178] },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Exam Info
  doc.setFontSize(14);
  doc.text('[ Examination Information ]', 20, yPos);
  yPos += 10;

  const examData = [
    ['Exam Type', result.examInfo.examType],
    ['Exam Part', result.examInfo.examPart],
    ['Exam Date', result.examInfo.examDate],
    ['Hospital', result.examInfo.hospital],
    ['Referring Dr.', result.examInfo.referringPhysician],
    ['Reading Dr.', result.examInfo.readingPhysician],
  ].filter(row => row[1]);

  doc.autoTable({
    startY: yPos,
    head: [['Field', 'Value']],
    body: examData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [8, 145, 178] },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Impression
  doc.setFontSize(14);
  doc.text('[ Impression ]', 20, yPos);
  yPos += 10;

  const impressionData = [
    ['Overall Severity', result.impression.overallSeverity],
    ['Diagnosis', result.impression.diagnosis],
    ['Summary', result.impression.summary],
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Field', 'Value']],
    body: impressionData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [8, 145, 178] },
    columnStyles: { 1: { cellWidth: 120 } },
  });

  // New page for findings
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.text('[ Detailed Findings ]', 20, yPos);
  yPos += 10;

  const findingsData = result.findings.map((f, i) => [
    i + 1,
    f.category,
    f.description,
    f.isNormal ? 'Normal' : 'Abnormal',
    f.severity
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Category', 'Description', 'Status', 'Severity']],
    body: findingsData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [8, 145, 178] },
    columnStyles: { 
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 90 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
    },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Medical Terms (if space available, otherwise new page)
  if (result.medicalTerms.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('[ Medical Terms Explanation ]', 20, yPos);
    yPos += 10;

    const termsData = result.medicalTerms.map((t, i) => [
      i + 1,
      t.term,
      t.explanation
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['#', 'Term', 'Explanation']],
      body: termsData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [8, 145, 178] },
      columnStyles: { 
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 130 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Recommendations
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('[ Recommendations ]', 20, yPos);
  yPos += 10;

  const recoData = [
    ['Urgency', result.recommendations.urgency],
    ['Follow-up', result.recommendations.followUp],
    ['Department', result.recommendations.department],
    ['Notes', result.recommendations.notes],
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Field', 'Value']],
    body: recoData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [8, 145, 178] },
    columnStyles: { 1: { cellWidth: 120 } },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated: ${new Date().toLocaleString('ko-KR')} | Page ${i} of ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
  }

  doc.save(`${fileName}_Analysis_Report.pdf`);
};
