import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
});

app.use('/api/', limiter);

// File upload configuration
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
      cb(new Error('지원하지 않는 파일 형식입니다. JPG, PNG, PDF만 업로드 가능합니다.'));
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Medical Report API is running' });
});

// Main analysis endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Step 1: Basic medical report analysis
    const basicPrompt = `당신은 의료 영상 판독 전문가입니다. 첨부된 의료 검사 결과지를 분석하여 다음 정보를 추출해주세요.

반드시 아래 JSON 형식으로 응답해주세요:

{
  "patientInfo": {
    "patientId": "환자 ID",
    "name": "환자 이름 (있는 경우, 없으면 빈 문자열)",
    "age": "나이",
    "gender": "성별 (M/F)",
    "birthDate": "생년월일 (있는 경우)"
  },
  "examInfo": {
    "examType": "검사 종류 (예: Brain MRI)",
    "examPart": "검사 부위",
    "examDate": "검사 날짜",
    "hospital": "병원명",
    "referringPhysician": "의뢰 의사",
    "readingPhysician": "판독 의사"
  },
  "findings": [
    {
      "category": "소견 카테고리",
      "description": "상세 소견 설명",
      "isNormal": true/false,
      "severity": "정상/경증/중등도/중증"
    }
  ],
  "impression": {
    "summary": "판독 의견 요약",
    "diagnosis": "주요 진단명",
    "overallSeverity": "정상/경증/중등도/중증"
  },
  "medicalTerms": [
    {
      "term": "의학 용어",
      "explanation": "쉬운 설명"
    }
  ],
  "recommendations": {
    "followUp": "추천 후속 조치",
    "department": "추천 진료과",
    "urgency": "낮음/중간/높음",
    "notes": "기타 주의사항"
  }
}

반드시 유효한 JSON 형식으로만 응답하세요.`;

    console.log('Step 1: Analyzing medical report...');
    const basicResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: basicPrompt },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    let basicAnalysis;
    try {
      const analysisText = basicResponse.choices[0].message.content;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      basicAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json({ 
        error: 'AI 응답 파싱 오류',
        details: 'OpenAI 응답을 처리하는 중 오류가 발생했습니다.'
      });
    }

    // Step 2: Get ICD-10 codes and additional tests
    console.log('Step 2: Searching for ICD-10 codes and additional tests...');
    const findingsText = basicAnalysis.findings.map(f => f.description).join('; ');
    const diagnosis = basicAnalysis.impression.diagnosis || basicAnalysis.impression.summary;

    const icdPrompt = `당신은 ICD-10 코드 전문가이자 임상 의학 전문가입니다.

다음 판독 소견과 진단을 분석하여 JSON 형식으로 응답해주세요:

진단: ${diagnosis}
소견: ${findingsText}

{
  "diseaseCodes": {
    "confirmed": [
      {
        "code": "ICD-10 코드 (예: I63.9)",
        "name": "질병명 (한글)",
        "englishName": "질병명 (영문)",
        "description": "코드 설명",
        "confidence": "확실함"
      }
    ],
    "recommended": [
      {
        "code": "ICD-10 코드",
        "name": "질병명 (한글)",
        "englishName": "질병명 (영문)",
        "description": "코드 설명",
        "confidence": "추정"
      }
    ]
  },
  "confirmedDiseaseDetails": [
    {
      "diseaseName": "확실한 질병명",
      "icdCode": "ICD-10 코드",
      "additionalTests": {
        "imaging": [
          {
            "testName": "검사명 (예: Brain MRI with contrast)",
            "purpose": "검사 목적",
            "reason": "왜 이 검사가 필요한지 상세 설명",
            "expectedFindings": "이 검사로 확인할 수 있는 소견"
          }
        ],
        "bloodTests": [
          {
            "testName": "혈액검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ],
        "functionalTests": [
          {
            "testName": "기능검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ],
        "biopsyTests": [
          {
            "testName": "조직검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ],
        "otherTests": [
          {
            "testName": "기타 검사명",
            "purpose": "검사 목적",
            "reason": "필요한 이유",
            "expectedFindings": "예상 결과"
          }
        ]
      },
      "clinicPreparation": {
        "items": [
          "일반병원에서 준비해야 할 사항"
        ],
        "documents": [
          "필요한 서류"
        ],
        "precautions": [
          "주의사항"
        ]
      },
      "universityHospitalStrategy": {
        "department": "방문할 진료과",
        "purpose": "방문 목적",
        "requiredDocuments": [
          "필요 서류"
        ],
        "expectedProcedure": "예상 진료 절차",
        "insuranceTips": [
          "보험 관련 팁"
        ]
      }
    }
  ]
}

중요:
1. 확실한 병명(confirmed) 2개를 반드시 제공하세요
2. 추천 병명(recommended) 2개를 반드시 제공하세요
3. 각 확실한 병명에 대해 가능한 모든 추가 검사를 나열하세요
4. 검사 이유를 구체적으로 설명하세요
5. 일반병원 준비사항과 대학병원 전략을 상세히 작성하세요
6. 반드시 유효한 JSON으로만 응답하세요`;

    const icdResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 ICD-10 코드 전문가이자 임상 의학 전문가입니다. 정확한 질병 코드와 필요한 검사를 제시합니다.'
        },
        {
          role: 'user',
          content: icdPrompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.2,
    });

    let icdAnalysis;
    try {
      const icdText = icdResponse.choices[0].message.content;
      const jsonMatch = icdText.match(/\{[\s\S]*\}/);
      icdAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : icdText);
    } catch (parseError) {
      console.error('ICD JSON parsing error:', parseError);
      icdAnalysis = {
        diseaseCodes: { confirmed: [], recommended: [] },
        confirmedDiseaseDetails: []
      };
    }

    // Combine all results
    const finalResult = {
      ...basicAnalysis,
      diseaseCodes: icdAnalysis.diseaseCodes,
      confirmedDiseaseDetails: icdAnalysis.confirmedDiseaseDetails
    };

    res.json({
      success: true,
      data: finalResult,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        analyzedAt: new Date().toISOString(),
        model: 'gpt-4o'
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'OpenAI API 키 오류',
        details: 'API 키를 확인해주세요.'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: '요청 한도 초과',
        details: 'OpenAI API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    res.status(500).json({ 
      error: '분석 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    await openai.models.list();
    res.json({ 
      status: 'ok',
      message: 'OpenAI API 연결 성공',
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'OpenAI API 연결 실패',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '파일 크기가 10MB를 초과합니다.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '요청하신 엔드포인트를 찾을 수 없습니다.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Medical Report API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
