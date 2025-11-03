import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowedDomains = [
      'http://localhost:5173',
      'https://studiojuai.vercel.app',
      'https://medical-report-analyzer-ten.vercel.app',
      /^https:\/\/medical-report-analyzer-.*\.vercel\.app$/
    ];
    
    if (!origin || allowedDomains.some(domain => {
      if (domain instanceof RegExp) {
        return domain.test(origin);
      }
      return domain === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function encodeFileToBase64(buffer) {
  return buffer.toString('base64');
}

async function convertPdfToImage(buffer) {
  return buffer.toString('base64');
}

async function analyzeBasicReport(base64Image, mimeType) {
  const content = [
    {
      type: "text",
      text: `당신은 의료 영상 판독 보고서 분석 전문가입니다. 
제공된 판독지를 분석하여 다음 정보를 정확하게 추출해주세요:

응답 형식:
{
  "patientInfo": {
    "patientId": "환자번호",
    "name": "환자명",
    "age": "나이",
    "gender": "성별"
  },
  "examInfo": {
    "examType": "검사종류",
    "examPart": "검사부위",
    "examDate": "검사일자",
    "hospital": "병원명"
  },
  "findings": [
    {
      "category": "소견 카테고리",
      "description": "소견 내용",
      "severity": "정상/경증/중등도/중증",
      "isNormal": true
    }
  ],
  "impression": {
    "diagnosis": "진단명",
    "summary": "판독 요약",
    "overallSeverity": "정상/경증/중등도/중증"
  },
  "medicalTerms": [
    {
      "term": "의학용어",
      "explanation": "설명"
    }
  ],
  "recommendations": {
    "urgency": "높음/중간/낮음",
    "followUp": "후속 조치",
    "department": "추천 진료과",
    "notes": "주의사항"
  }
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
    messages: [{ role: "user", content: content }],
    max_tokens: 2000,
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

async function analyzeICDAndTests(findings, conclusion, examInfo) {
  const prompt = `당신은 의료 보험 청구 및 진료 계획 전문가입니다.

**판독 소견:**
${JSON.stringify(findings)}

**판독 의견:**
${JSON.stringify(conclusion)}

**검사 정보:**
${JSON.stringify(examInfo)}

다음 JSON 형식으로 응답해주세요:

{
  "diseaseCodes": {
    "confirmed": [
      {
        "code": "ICD-10 코드",
        "name": "병명 (한글)",
        "englishName": "병명 (영문)",
        "description": "병명 설명",
        "confidence": "높음"
      },
      {
        "code": "ICD-10 코드",
        "name": "병명 (한글)",
        "englishName": "병명 (영문)",
        "description": "병명 설명",
        "confidence": "중간"
      }
    ],
    "recommended": [
      {
        "code": "ICD-10 코드",
        "name": "병명 (한글)",
        "englishName": "병명 (영문)",
        "description": "병명 설명",
        "confidence": "중간"
      },
      {
        "code": "ICD-10 코드",
        "name": "병명 (한글)",
        "englishName": "병명 (영문)",
        "description": "병명 설명",
        "confidence": "낮음"
      }
    ]
  },
  "confirmedDiseaseDetails": [
    {
      "diseaseName": "첫 번째 확실한 병명",
      "icdCode": "ICD-10 코드",
      "additionalTests": {
        "imaging": [
          {
            "testName": "검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 소견"
          }
        ],
        "bloodTests": [
          {
            "testName": "검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ],
        "functionalTests": [
          {
            "testName": "검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ],
        "biopsyTests": [
          {
            "testName": "검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 소견"
          }
        ],
        "otherTests": [
          {
            "testName": "검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ]
      },
      "clinicPreparation": {
        "items": ["준비항목1", "준비항목2", "준비항목3"],
        "documents": ["서류1", "서류2", "서류3"],
        "precautions": ["주의사항1", "주의사항2", "주의사항3"]
      },
      "universityHospitalStrategy": {
        "department": "방문 진료과",
        "purpose": "방문 목적",
        "requiredDocuments": ["필요서류1", "필요서류2"],
        "expectedProcedure": "예상 진료 절차",
        "insuranceTips": ["보험팁1", "보험팁2", "보험팁3"]
      }
    },
    {
      "diseaseName": "두 번째 확실한 병명",
      "icdCode": "ICD-10 코드",
      "additionalTests": {
        "imaging": [],
        "bloodTests": [],
        "functionalTests": [],
        "biopsyTests": [],
        "otherTests": []
      },
      "clinicPreparation": {
        "items": [],
        "documents": [],
        "precautions": []
      },
      "universityHospitalStrategy": {
        "department": "",
        "purpose": "",
        "requiredDocuments": [],
        "expectedProcedure": "",
        "insuranceTips": []
      }
    }
  ]
}

요구사항:
1. confirmed에는 정확히 2개의 확실한 병명
2. recommended에는 정확히 2개의 추천 병명
3. confirmedDiseaseDetails에는 confirmed 2개 병명에 대한 상세 정보
4. 각 검사는 testName, purpose, reason, expectedFindings 필드 포함
5. 한국 의료 시스템 기준으로 작성`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4000,
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    console.log('분석 요청 받음');
    console.log('Origin:', req.headers.origin);

    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    console.log('파일 정보:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    let base64Image;
    const mimeType = req.file.mimetype;

    if (mimeType === 'application/pdf') {
      console.log('PDF 파일 처리 중...');
      base64Image = await convertPdfToImage(req.file.buffer);
    } else {
      base64Image = encodeFileToBase64(req.file.buffer);
    }

    console.log('Step 1: 기본 판독지 분석 시작...');
    
    const basicAnalysisText = await analyzeBasicReport(base64Image, mimeType);
    console.log('Step 1 완료');

    let basicAnalysis;
    try {
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

    const icdAnalysisText = await analyzeICDAndTests(
      basicAnalysis.findings,
      basicAnalysis.impression,
      basicAnalysis.examInfo
    );
    console.log('Step 2 완료');

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
        // 프론트엔드와 호환되는 형식으로 변환
    const finalResult = {
      // 기본 정보 유지
      patientInfo: basicAnalysis.patientInfo,
      examInfo: basicAnalysis.examInfo,
      findings: basicAnalysis.findings,
      impression: basicAnalysis.impression,
      medicalTerms: basicAnalysis.medicalTerms,
      recommendations: basicAnalysis.recommendations,
      
      // ICD-10 정보 추가
      diseaseCodes: icdAnalysis.diseaseCodes,
      confirmedDiseaseDetails: icdAnalysis.confirmedDiseaseDetails,
      
      // 연구 목적 명시
      disclaimer: '본 분석 결과는 개인 연구 목적으로만 사용됩니다. 의료 진단이나 치료 목적으로 사용할 수 없습니다.'
    };

    console.log('분석 완료, 결과 전송');
    res.json(finalResult);

  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    console.error('에러 스택:', error.stack);
    
    if (error.message && error.message.includes('rate_limit_exceeded')) {
      return res.status(429).json({ 
        error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    
    if (error.message && error.message.includes('invalid_api_key')) {
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
