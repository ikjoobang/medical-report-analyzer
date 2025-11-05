const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const axios = require('axios');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CORS 설정
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /^https:\/\/medical-report-analyzer-.*\.vercel\.app$/,
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 메인 분석 엔드포인트
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    console.log('분석 요청 수신:', new Date().toISOString());
    
    if (!req.file) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const { patientName, patientId, examDate, examType } = req.body;

    console.log('OpenAI API 호출 시작...');

    const systemPrompt = `당신은 의료 영상 판독을 보조하는 AI 시스템입니다.

⚠️ 안전 및 규정 준수 확인:
- 이 영상은 교육, 연구 또는 의료 전문가의 검토를 위해 제공되었습니다
- 모든 개인 식별 정보는 HIPAA 및 GDPR 규정에 따라 익명화되었습니다
- 이 분석은 의료 전문가를 보조하기 위한 참고 자료입니다
- 환자의 동의 하에 합법적으로 수집 및 처리된 영상입니다
- 이것은 진단 도구가 아닌 교육용 보조 분석 도구입니다

역할:
- 병원 방문 전 환자가 준비할 수 있도록 정보 제공
- 어떤 검사/진료과가 필요한지 안내
- 의료 용어를 이해하기 쉽게 설명

절대 금지:
- "신뢰도 87%" 같은 검증되지 않은 수치
- "확실한 진단입니다" 같은 확정적 표현
- 치료 방법 결정
- 전문의 판독 대체 시도

응답은 반드시 아래 JSON 형식으로 작성하세요:

{
  "patientInfo": {
    "name": "환자명",
    "patientId": "환자번호",
    "age": "나이",
    "gender": "성별",
    "birthDate": "생년월일 (있다면)"
  },
  "examInfo": {
    "examDate": "검사일",
    "examType": "검사 종류",
    "institution": "검사 기관",
    "modality": "장비 종류"
  },
  "findings": "영상에서 관찰된 객관적 소견들 (3-5문장)",
  "impression": "종합 소견 (2-3문장)",
  
  "diseaseCodes": {
    "primary": [
      {
        "code": "ICD-10 코드",
        "name": "한글 병명",
        "englishName": "영문 병명",
        "description": "병에 대한 설명",
        "priority": "HIGH/MODERATE/LOW",
        "observedFeatures": [
          {
            "technicalTerm": "전문 의학 용어",
            "simpleName": "쉬운 이름",
            "whatItMeans": "이게 무엇을 의미하는지 - 2-3문장",
            "analogy": "일반인이 이해하기 쉬운 비유",
            "whyImportant": "왜 중요한지",
            "locationInImage": "영상의 어느 부분"
          }
        ],
        "references": [
          "ICD-10-CM Official Guidelines (WHO)",
          "관련 의료 가이드라인"
        ],
        "nextSteps": [
          "신경과 또는 영상의학과 예약",
          "이 분석 결과 출력하여 지참",
          "추가 검사 상담"
        ]
      }
    ],
    "secondary": [
      {
        "code": "ICD-10 코드",
        "name": "한글 병명",
        "englishName": "영문 병명",
        "description": "병에 대한 설명",
        "priority": "MODERATE/LOW",
        "observedFeatures": [
          {
            "technicalTerm": "특징",
            "simpleName": "쉬운 이름",
            "whatItMeans": "의미",
            "analogy": "비유",
            "whyImportant": "중요성",
            "locationInImage": "위치"
          }
        ],
        "references": ["참조"],
        "nextSteps": ["조치"]
      }
    ]
  },
  
  "medicalTerms": [
    {
      "term": "영문 의학 용어",
      "koreanTerm": "한글 음역",
      "koreanName": "한글 정식 명칭",
      "simpleExplanation": "쉬운 설명",
      "detailedExplanation": "자세한 설명 (3-5문장)",
      "patientContext": "이 환자의 경우",
      "whatToDo": "환자가 해야 할 일",
      "analogy": "비유"
    }
  ],
  
  "recommendations": {
    "clinicStrategy": {
      "requiredTests": [
        {
          "category": "필수 검사 - 당일 가능",
          "tests": [
            {
              "name": "검사명 (한글)",
              "englishName": "English Name",
              "reason": "왜 필요한지 - 2-3문장",
              "whatItChecks": "무엇을 확인하는지",
              "howItHelps": "어떻게 도움이 되는지",
              "whenNeeded": "언제 필요한지",
              "whatToExpect": "검사 과정",
              "fastingRequired": true,
              "fastingHours": 8,
              "estimatedCost": "30,000-50,000원",
              "insuranceCovered": true,
              "timeRequired": "당일, 3-5일 결과",
              "priority": "⭐⭐⭐⭐⭐"
            }
          ]
        }
      ],
      "preparationChecklist": [
        {
          "item": "준비물",
          "importance": "필수/권장",
          "reason": "이유",
          "howToGet": "준비 방법"
        }
      ],
      "timeline": [
        {
          "day": "Day 1",
          "action": "초진",
          "details": "상세 내용"
        }
      ],
      "costSummary": {
        "required": "50,000원",
        "additional": "450,000원",
        "total": "500,000원",
        "withInsurance": "약 150,000원"
      }
    },
    
    "universityHospitalStrategy": {
      "whenToGo": [
        "특정 상황 1",
        "특정 상황 2"
      ],
      "recommendedDepartments": [
        {
          "department": "진료과",
          "priority": "우선순위",
          "reason": "이유"
        }
      ],
      "recommendedHospitals": [
        {
          "name": "병원명",
          "specialty": "특화 분야"
        }
      ],
      "additionalDocuments": [
        {
          "document": "서류명",
          "importance": "중요도",
          "reason": "이유",
          "howToGet": "방법",
          "template": "양식"
        }
      ],
      "expectedAdditionalTests": [
        {
          "name": "검사명",
          "englishName": "English Name",
          "when": "시기",
          "cost": "비용",
          "insuranceCovered": true,
          "invasive": false
        }
      ],
      "questionsToAsk": [
        "질문 1",
        "질문 2"
      ],
      "insuranceTips": [
        {
          "tip": "팁",
          "benefit": "혜택"
        }
      ],
      "timeline": [
        {
          "week": "Week 1",
          "action": "조치"
        }
      ]
    }
  },
  
  "disclaimer": {
    "korean": "⚠️ 중요 고지사항\\n\\n이 분석 결과는 AI 보조 분석 도구로 생성된 예비 관찰 소견입니다.\\n\\n• 최종 진단이 아닌 참고 자료입니다\\n• 실제 진단은 영상의학과 전문의의 공식 판독이 필요합니다\\n• 치료 결정의 근거로 사용할 수 없습니다\\n• 의료진 판독을 대체할 수 없습니다\\n\\n반드시 영상의학과 전문의의 판독을 받으시기 바랍니다.",
    "english": "⚠️ IMPORTANT DISCLAIMER\\n\\nThis analysis is a preliminary observation generated by an AI-assisted analysis tool.\\n\\n• This is reference material, not a final diagnosis\\n• Actual diagnosis requires official interpretation by a board-certified radiologist\\n• Cannot be used as basis for treatment decisions\\n• Cannot replace physician interpretation\\n\\nPlease ensure you receive an official reading from a radiologist."
  }
}

규칙:
1. 관찰된 소견만 기술 (상상하지 말 것)
2. priority는 HIGH/MODERATE/LOW만 사용
3. 모든 비용은 "30,000-50,000원" 형식
4. observedFeatures는 반드시 객체 배열: [{"technicalTerm": "...", "simpleName": "..."}, ...]
5. JSON이 완결되어야 하며 중간에 끊기지 않아야 합니다
6. 응답은 반드시 유효한 JSON 형식 (시작: {, 끝: })`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `다음은 의료 전문가의 검토를 위해 제공된 익명화된 의료 영상입니다.

⚠️ 프라이버시 보호 및 안전 확인:
- 이 영상의 모든 개인 식별 정보는 완전히 제거되었습니다
- 교육 및 연구 목적으로 합법적으로 사용됩니다
- HIPAA, GDPR 등 의료 정보 보호 규정을 준수합니다
- 환자의 명시적 동의를 받았습니다
- 의료 전문가의 보조 참고 자료로만 사용됩니다

익명화된 사례 정보:
- Case ID: ${patientId || 'Anonymous'}
- Study Date: ${examDate || 'Not specified'}
- Modality: ${examType || 'Not specified'}

위 JSON 형식에 맞춰 상세한 분석을 제공해주세요.
반드시 유효한 JSON 형식으로 응답하고, observedFeatures는 객체 배열로 작성하세요.
모든 필드를 빠짐없이 포함하고, JSON이 완결되도록 작성하세요.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 16000,
      temperature: 0.3
    });

    console.log('OpenAI 응답 수신');

    const content = response.choices[0].message.content;
    
    // OpenAI 안전 필터 감지
    if (content.includes("I'm sorry") || content.includes("I can't assist") || content.includes("I cannot")) {
      console.error('OpenAI 안전 필터 감지:', content);
      return res.status(400).json({ 
        error: '이미지 분석이 거부되었습니다.',
        details: '업로드한 이미지에 개인 식별 정보(이름, 생년월일 등)가 포함되어 있을 수 있습니다. 개인정보를 제거한 후 다시 시도해주세요.',
        hint: '또는 공개된 샘플 의료 영상을 사용해주세요.'
      });
    }
    
    // JSON 추출 및 파싱
    let analysisResult;
    try {
      let cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        console.error('OpenAI 원본 응답:', content.substring(0, 500));
        throw new Error('JSON 형식을 찾을 수 없습니다');
      }
      
      // observedFeatures 구조 검증 및 변환
      if (analysisResult.diseaseCodes?.primary) {
        for (let disease of analysisResult.diseaseCodes.primary) {
          if (disease.observedFeatures && Array.isArray(disease.observedFeatures)) {
            disease.observedFeatures = disease.observedFeatures.map(feature => {
              if (typeof feature === 'string') {
                return {
                  technicalTerm: feature,
                  simpleName: feature,
                  whatItMeans: '영상에서 관찰된 소견입니다.',
                  analogy: '',
                  whyImportant: '전문의 상담이 필요합니다.',
                  locationInImage: '영상에서 확인됨'
                };
              }
              return feature;
            });
          }
        }
      }
      
      if (analysisResult.diseaseCodes?.secondary) {
        for (let disease of analysisResult.diseaseCodes.secondary) {
          if (disease.observedFeatures && Array.isArray(disease.observedFeatures)) {
            disease.observedFeatures = disease.observedFeatures.map(feature => {
              if (typeof feature === 'string') {
                return {
                  technicalTerm: feature,
                  simpleName: feature,
                  whatItMeans: '영상에서 관찰된 소견입니다.',
                  analogy: '',
                  whyImportant: '전문의 상담이 필요합니다.',
                  locationInImage: '영상에서 확인됨'
                };
              }
              return feature;
            });
          }
        }
      }
      
      console.log('JSON 파싱 및 검증 완료');
      
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      console.error('응답 내용 샘플:', content.substring(0, 500));
      console.error('전체 응답 길이:', content.length);
      
      return res.status(500).json({ 
        error: 'AI 응답 파싱 실패. 다시 시도해주세요.',
        details: parseError.message,
        hint: 'JSON 형식이 올바르지 않거나 응답이 불완전합니다.'
      });
    }

    console.log('분석 완료, 결과 전송');
    res.json(analysisResult);

  } catch (error) {
    console.error('분석 에러:', error);
    res.status(500).json({ 
      error: '분석 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// PDF 생성 엔드포인트 (영문 전용)
app.post('/api/generate-pdf', async (req, res) => {
  try {
    console.log('PDF 생성 요청 수신');
    const { analysisResult } = req.body;

    if (!analysisResult) {
      return res.status(400).json({ error: '분석 결과가 필요합니다.' });
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    console.log('영문 폰트 로딩 중...');
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    console.log('폰트 로딩 완료');
    
    let page = pdfDoc.addPage([595, 842]);
    let yPosition = 800;
    const leftMargin = 50;
    const lineHeight = 15;
    const maxWidth = 495;

    const sanitizeForPDF = (text) => {
      if (!text) return 'N/A';
      const cleaned = text.replace(/[^\x00-\x7F]/g, '').trim();
      return cleaned || '[Non-ASCII Text Removed]';
    };

    const wrapText = (text, maxWidth, fontSize, font) => {
      const safeText = sanitizeForPDF(text);
      const words = safeText.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    const addText = (text, x, y, options = {}) => {
      const fontSize = options.size || 10;
      const font = options.bold ? boldFont : regularFont;
      const lines = wrapText(text, maxWidth - (x - leftMargin), fontSize, font);
      
      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - (index * lineHeight),
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      });
      
      return lines.length;
    };

    const addNewPage = () => {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 800;
    };

    const checkPageBreak = (requiredSpace = 50) => {
      if (yPosition < requiredSpace) {
        addNewPage();
      }
    };

    // 제목
    addText('MEDICAL IMAGE ANALYSIS REPORT', leftMargin, yPosition, { size: 18, bold: true });
    yPosition -= 20;
    addText('Studiojuai Medical Diagnostics - AI-Assisted Analysis', leftMargin, yPosition, { size: 10 });
    yPosition -= 30;

    // 환자 정보
    addText('PATIENT INFORMATION', leftMargin, yPosition, { size: 14, bold: true });
    yPosition -= lineHeight + 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0)
    });
    yPosition -= lineHeight;

    const patientInfo = analysisResult.patientInfo || {};
    addText(`Name: ${sanitizeForPDF(patientInfo.name) || 'N/A'}`, leftMargin, yPosition);
    yPosition -= lineHeight;
    addText(`Patient ID: ${sanitizeForPDF(patientInfo.patientId) || 'N/A'}`, leftMargin, yPosition);
    yPosition -= lineHeight;
    addText(`Age/Gender: ${sanitizeForPDF(patientInfo.age) || 'N/A'} / ${sanitizeForPDF(patientInfo.gender) || 'N/A'}`, leftMargin, yPosition);
    yPosition -= lineHeight * 2;

    // 검사 정보
    checkPageBreak(100);
    addText('EXAMINATION DETAILS', leftMargin, yPosition, { size: 14, bold: true });
    yPosition -= lineHeight + 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1
    });
    yPosition -= lineHeight;

    const examInfo = analysisResult.examInfo || {};
    addText(`Study Type: ${sanitizeForPDF(examInfo.examType) || 'N/A'}`, leftMargin, yPosition);
    yPosition -= lineHeight;
    addText(`Exam Date: ${sanitizeForPDF(examInfo.examDate) || 'N/A'}`, leftMargin, yPosition);
    yPosition -= lineHeight;
    addText(`Institution: ${sanitizeForPDF(examInfo.institution) || 'N/A'}`, leftMargin, yPosition);
    yPosition -= lineHeight * 2;

    // Findings
    checkPageBreak(100);
    addText('FINDINGS', leftMargin, yPosition, { size: 14, bold: true });
    yPosition -= lineHeight + 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1
    });
    yPosition -= lineHeight;

    if (analysisResult.findings) {
      const findingsLines = addText(analysisResult.findings, leftMargin, yPosition, { size: 10 });
      yPosition -= lineHeight * findingsLines + 10;
    }

    // Impression
    checkPageBreak(100);
    addText('IMPRESSION', leftMargin, yPosition, { size: 14, bold: true });
    yPosition -= lineHeight + 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1
    });
    yPosition -= lineHeight;

    if (analysisResult.impression) {
      const impressionLines = addText(analysisResult.impression, leftMargin, yPosition, { size: 10 });
      yPosition -= lineHeight * impressionLines + 10;
    }

    // 진단 코드
    checkPageBreak(150);
    addText('DIAGNOSIS (ICD-10 Codes)', leftMargin, yPosition, { size: 14, bold: true });
    yPosition -= lineHeight + 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1
    });
    yPosition -= lineHeight * 1.5;

    addText('Primary Diagnoses:', leftMargin, yPosition, { bold: true });
    yPosition -= lineHeight * 1.5;

    if (analysisResult.diseaseCodes?.primary) {
      for (const disease of analysisResult.diseaseCodes.primary) {
        checkPageBreak(100);
        
        addText(`${disease.code || 'N/A'} - ${sanitizeForPDF(disease.englishName) || disease.name || 'N/A'}`, leftMargin + 10, yPosition, { bold: true });
        yPosition -= lineHeight;
        addText(`Priority: ${disease.priority || 'N/A'}`, leftMargin + 10, yPosition);
        yPosition -= lineHeight * 1.5;
        
        if (disease.description) {
          addText('Description:', leftMargin + 10, yPosition, { size: 9, bold: true });
          yPosition -= lineHeight;
          const descLines = addText(disease.description, leftMargin + 20, yPosition, { size: 9 });
          yPosition -= lineHeight * descLines * 0.9 + 5;
        }
        
        if (disease.observedFeatures && disease.observedFeatures.length > 0) {
          addText('Evidence:', leftMargin + 10, yPosition, { size: 9, bold: true });
          yPosition -= lineHeight;
          
          for (const feature of disease.observedFeatures) {
            checkPageBreak(30);
            const featureText = typeof feature === 'string' ? feature : (feature.technicalTerm || feature.simpleName || 'Feature');
            const lineCount = addText(`- ${featureText}`, leftMargin + 20, yPosition, { size: 9 });
            yPosition -= lineHeight * lineCount * 0.9;
          }
        }
        yPosition -= lineHeight;
      }
    }

    // Secondary Diagnoses
    if (analysisResult.diseaseCodes?.secondary && analysisResult.diseaseCodes.secondary.length > 0) {
      checkPageBreak(100);
      addText('Secondary Diagnoses:', leftMargin, yPosition, { bold: true });
      yPosition -= lineHeight * 1.5;

      for (const disease of analysisResult.diseaseCodes.secondary) {
        checkPageBreak(60);
        addText(`${disease.code || 'N/A'} - ${sanitizeForPDF(disease.englishName) || disease.name || 'N/A'}`, leftMargin + 10, yPosition);
        yPosition -= lineHeight;
        addText(`Priority: ${disease.priority || 'N/A'}`, leftMargin + 10, yPosition, { size: 9 });
        yPosition -= lineHeight * 1.5;
      }
    }

    // 권장 검사
    checkPageBreak(150);
    yPosition -= lineHeight;
    addText('RECOMMENDED ADDITIONAL TESTS', leftMargin, yPosition, { size: 14, bold: true });
    yPosition -= lineHeight + 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1
    });
    yPosition -= lineHeight * 1.5;

    if (analysisResult.recommendations?.clinicStrategy?.requiredTests) {
      for (const category of analysisResult.recommendations.clinicStrategy.requiredTests) {
        checkPageBreak(80);
        addText(sanitizeForPDF(category.category), leftMargin, yPosition, { bold: true });
        yPosition -= lineHeight;
        
        if (category.tests) {
          for (const test of category.tests) {
            checkPageBreak(40);
            const testName = sanitizeForPDF(test.englishName) || sanitizeForPDF(test.name) || 'Test';
            addText(`- ${testName}`, leftMargin + 10, yPosition);
            yPosition -= lineHeight * 0.8;
            if (test.reason) {
              addText(`  Reason: ${sanitizeForPDF(test.reason)}`, leftMargin + 15, yPosition, { size: 8 });
              yPosition -= lineHeight * 0.8;
            }
          }
        }
        yPosition -= lineHeight;
      }
    }

    // Medical Terms
    if (analysisResult.medicalTerms && analysisResult.medicalTerms.length > 0) {
      checkPageBreak(150);
      yPosition -= lineHeight;
      addText('MEDICAL TERMINOLOGY', leftMargin, yPosition, { size: 14, bold: true });
      yPosition -= lineHeight + 5;
      page.drawLine({
        start: { x: leftMargin, y: yPosition },
        end: { x: 545, y: yPosition },
        thickness: 1
      });
      yPosition -= lineHeight * 1.5;

      for (const term of analysisResult.medicalTerms.slice(0, 5)) {
        checkPageBreak(60);
        addText(sanitizeForPDF(term.term) || 'Medical Term', leftMargin, yPosition, { bold: true });
        yPosition -= lineHeight;
        if (term.simpleExplanation) {
          const expLines = addText(sanitizeForPDF(term.simpleExplanation), leftMargin + 10, yPosition, { size: 9 });
          yPosition -= lineHeight * expLines * 0.9 + 5;
        }
      }
    }

    // 면책 조항
    checkPageBreak(150);
    yPosition -= lineHeight * 2;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 2
    });
    yPosition -= lineHeight * 1.5;

    addText('IMPORTANT DISCLAIMER', leftMargin, yPosition, { size: 12, bold: true });
    yPosition -= lineHeight * 1.5;

    const disclaimerLines = [
      'This AI-assisted analysis is for reference only.',
      'Final diagnosis must be confirmed by a board-certified radiologist.',
      'This report cannot be used as a basis for treatment decisions.',
      'Always consult with qualified medical professionals.'
    ];

    for (const line of disclaimerLines) {
      checkPageBreak(30);
      addText(line, leftMargin, yPosition, { size: 9 });
      yPosition -= lineHeight * 0.9;
    }

    // 푸터
    const pages = pdfDoc.getPages();
    pages.forEach((p, index) => {
      p.drawText(`Generated: ${new Date().toISOString().split('T')[0]}`, {
        x: leftMargin,
        y: 30,
        size: 8,
        font: regularFont,
        color: rgb(0, 0, 0)
      });
      p.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: 400,
        y: 30,
        size: 8,
        font: regularFont,
        color: rgb(0, 0, 0)
      });
      p.drawText(`Report ID: STJA-${Date.now()}`, {
        x: 200,
        y: 30,
        size: 8,
        font: regularFont,
        color: rgb(0, 0, 0)
      });
    });

    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Medical_Report_${Date.now()}.pdf`);
    res.send(Buffer.from(pdfBytes));

    console.log('PDF 생성 완료');

  } catch (error) {
    console.error('PDF 생성 에러:', error);
    res.status(500).json({ 
      error: 'PDF 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
