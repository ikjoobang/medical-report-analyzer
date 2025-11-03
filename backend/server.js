import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import multer from 'multer';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Railway의 프록시 신뢰 설정
app.set('trust proxy', 1);

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helmet 보안 설정 (CSP 비활성화)
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS 설정
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://studiojuai.vercel.app'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100개 요청
});
app.use('/api/', limiter);

// Multer 설정 (메모리 저장)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  }
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 파일을 Base64로 인코딩하는 함수
function encodeFileToBase64(buffer) {
  return buffer.toString('base64');
}

// PDF를 이미지로 변환하는 함수 (간단한 구현)
async function convertPdfToImage(buffer) {
  // 실제 환경에서는 pdf-parse 또는 pdf2pic 같은 라이브러리 사용 권장
  // 현재는 Base64로 직접 전달
  return buffer.toString('base64');
}

// Step 1: 기본 판독지 분석
async function analyzeBasicReport(base64Image, mimeType) {
  const content = [
    {
      type: "text",
      text: `당신은 의료 영상 판독 보고서 분석 전문가입니다. 
제공된 판독지를 분석하여 다음 정보를 정확하게 추출해주세요:

1. 환자 정보 (Patient Information)
2. 검사 정보 (Examination Information)
3. 소견 (Findings)
4. 결론/진단 (Conclusion/Diagnosis)

각 섹션을 명확하게 구분하여 JSON 형식으로 응답해주세요.
응답 형식:
{
  "patientInfo": {
    "name": "환자명",
    "id": "환자번호",
    "age": "나이",
    "gender": "성별",
    "examDate": "검사일자"
  },
  "examInfo": {
    "type": "검사종류",
    "bodyPart": "검사부위",
    "technique": "검사기법"
  },
  "findings": "소견 전체 내용",
  "conclusion": "결론/진단 내용"
}`
    },
    {
      type: "image_url",
      image_url: {
        url: `data:${mimeType};base64,${base64Image}`
      }
    }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: content
      }
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

// Step 2: ICD-10 코드 및 추가 검사 분석
async function analyzeICDAndTests(findings, conclusion) {
  const prompt = `당신은 의료 보험 청구 및 진료 계획 전문가입니다.

아래 판독지의 소견과 결론을 바탕으로 다음을 분석해주세요:

**소견 (Findings):**
${findings}

**결론/진단 (Conclusion):**
${conclusion}

---

다음 정보를 JSON 형식으로 제공해주세요:

{
  "icdCodes": {
    "confirmed": [
      {
        "code": "ICD-10 코드",
        "description": "병명 (한글)",
        "confidence": "확실도 (높음/중간)"
      }
    ],
    "recommended": [
      {
        "code": "ICD-10 코드",
        "description": "병명 (한글)",
        "confidence": "확실도 (중간/낮음)"
      }
    ]
  },
  "additionalTests": {
    "imaging": [
      {
        "test": "검사명",
        "reason": "필요한 이유",
        "urgency": "긴급도 (높음/중간/낮음)"
      }
    ],
    "laboratory": [
      {
        "test": "검사명",
        "reason": "필요한 이유",
        "urgency": "긴급도"
      }
    ],
    "functional": [
      {
        "test": "검사명",
        "reason": "필요한 이유",
        "urgency": "긴급도"
      }
    ],
    "biopsy": [
      {
        "test": "검사명",
        "reason": "필요한 이유",
        "urgency": "긴급도"
      }
    ],
    "others": [
      {
        "test": "검사명",
        "reason": "필요한 이유",
        "urgency": "긴급도"
      }
    ]
  },
  "generalHospitalPreparation": [
    "준비사항 1",
    "준비사항 2"
  ],
  "universityHospitalStrategy": [
    "전략 1",
    "전략 2"
  ]
}

**요구사항:**
1. **ICD-10 코드**: 
   - "confirmed"에는 확실한 진단 2개 (confidence: 높음 또는 중간)
   - "recommended"에는 추가 고려 병명 2개 (confidence: 중간 또는 낮음)
   
2. **추가 검사 (additionalTests)**:
   - 각 카테고리별로 필요한 검사를 구체적으로 나열
   - 영상검사(imaging), 혈액/조직검사(laboratory), 기능검사(functional), 조직검사(biopsy), 기타(others)
   - 각 검사마다 이유와 긴급도 포함

3. **일반병원 준비사항 (generalHospitalPreparation)**:
   - 최소 3개 이상의 구체적인 준비사항
   - 서류, 검사 준비, 복약 등

4. **대학병원 방문 전략 (universityHospitalStrategy)**:
   - 최소 3개 이상의 실질적인 전략
   - 의뢰서 준비, 진료과 선택, 예약 팁 등

**중요**: 모든 내용은 한국 의료 시스템 기준으로 작성해주세요.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 3000,
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

// 메인 분석 엔드포인트
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    console.log('분석 요청 받음');

    if (!req.file) {
      return res.status(400).json({ 
        error: '파일이 업로드되지 않았습니다.' 
      });
    }

    console.log('파일 정보:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    let base64Image;
    const mimeType = req.file.mimetype;

    // PDF 처리
    if (mimeType === 'application/pdf') {
      console.log('PDF 파일 처리 중...');
      base64Image = await convertPdfToImage(req.file.buffer);
    } else {
      base64Image = encodeFileToBase64(req.file.buffer);
    }

    console.log('Step 1: 기본 판독지 분석 시작...');
    
    // Step 1: 기본 분석
    const basicAnalysisText = await analyzeBasicReport(base64Image, mimeType);
    console.log('Step 1 완료:', basicAnalysisText.substring(0, 200) + '...');

    // JSON 파싱
    let basicAnalysis;
    try {
      // Markdown 코드 블록 제거
      const cleanedText = basicAnalysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      basicAnalysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 텍스트:', basicAnalysisText);
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    console.log('Step 2: ICD-10 및 추가 검사 분석 시작...');

    // Step 2: ICD-10 코드 및 추가 검사 분석
    const icdAnalysisText = await analyzeICDAndTests(
      basicAnalysis.findings,
      basicAnalysis.conclusion
    );
    console.log('Step 2 완료:', icdAnalysisText.substring(0, 200) + '...');

    let icdAnalysis;
    try {
      const cleanedText = icdAnalysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      icdAnalysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('ICD JSON 파싱 오류:', parseError);
      console.error('원본 텍스트:', icdAnalysisText);
      throw new Error('ICD 분석 응답을 파싱할 수 없습니다.');
    }

    // 최종 결과 합치기
    const finalResult = {
      ...basicAnalysis,
      icdCodes: icdAnalysis.icdCodes,
      additionalTests: icdAnalysis.additionalTests,
      generalHospitalPreparation: icdAnalysis.generalHospitalPreparation,
      universityHospitalStrategy: icdAnalysis.universityHospitalStrategy
    };

    console.log('분석 완료, 결과 전송');
    res.json(finalResult);

  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    
    if (error.message?.includes('rate_limit_exceeded')) {
      return res.status(429).json({ 
        error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    
    if (error.message?.includes('invalid_api_key')) {
      return res.status(500).json({ 
        error: 'API 키 설정에 문제가 있습니다.' 
      });
    }

    res.status(500).json({ 
      error: '분석 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
  console.error('서버 에러:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: '파일 크기는 10MB를 초과할 수 없습니다.' 
      });
    }
    return res.status(400).json({ 
      error: '파일 업로드 중 오류가 발생했습니다.' 
    });
  }
  
  res.status(500).json({ 
    error: '서버 내부 오류가 발생했습니다.' 
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
