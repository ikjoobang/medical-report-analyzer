import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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
// CORS 설정 - 여러 도메인 허용
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://medical-report-analyzer-ten.vercel.app',
    'https://medical-report-analyzer.vercel.app',
    'https://medical-report-analyzer-git-main-ikjoobang-2128s-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
});

app.use('/api/', limiter);

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

    // Convert file to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Prepare prompt for OpenAI Vision
    const prompt = `당신은 의료 영상 판독 전문가입니다. 첨부된 의료 검사 결과지를 분석하여 다음 정보를 추출해주세요.

반드시 아래 JSON 형식으로 응답해주세요:

{
  "patientInfo": {
    "patientId": "환자 ID (예: 00002448)",
    "name": "환자 이름 (있는 경우, 없으면 빈 문자열)",
    "age": "나이 (예: 70세, 없으면 빈 문자열)",
    "gender": "성별 (M/F, 없으면 빈 문자열)",
    "birthDate": "생년월일 (있는 경우)"
  },
  "examInfo": {
    "examType": "검사 종류 (예: Brain MRI)",
    "examPart": "검사 부위 (예: 뇌, 복부 등)",
    "examDate": "검사 날짜 (YYYY-MM-DD 형식)",
    "hospital": "병원명 (있는 경우)",
    "referringPhysician": "의뢰 의사 (있는 경우)",
    "readingPhysician": "판독 의사 (있는 경우)"
  },
  "findings": [
    {
      "category": "소견 카테고리 (예: 뇌실질, 혈관, 구조물 등)",
      "description": "상세 소견 설명",
      "isNormal": true/false,
      "severity": "정상/경증/중등도/중증"
    }
  ],
  "impression": {
    "summary": "판독 의견 요약",
    "diagnosis": "주요 진단명 (있는 경우)",
    "overallSeverity": "정상/경증/중등도/중증"
  },
  "medicalTerms": [
    {
      "term": "의학 용어 (영문 또는 한문)",
      "explanation": "쉬운 한글 설명"
    }
  ],
  "recommendations": {
    "followUp": "추천 후속 조치 (예: 정기 검진, 추가 검사 등)",
    "department": "추천 진료과 (있는 경우)",
    "urgency": "긴급도 (낮음/중간/높음)",
    "notes": "기타 주의사항"
  }
}

중요 지침:
1. 문서에서 직접 확인되는 정보만 추출하세요.
2. 확인되지 않는 정보는 빈 문자열("")로 표시하세요.
3. 의학 용어는 일반인이 이해할 수 있도록 쉽게 설명하세요.
4. 심각도 평가는 소견 내용을 바탕으로 합리적으로 판단하세요.
5. 반드시 유효한 JSON 형식으로만 응답하세요.`;

    console.log('Sending request to OpenAI Vision API...');

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    console.log('OpenAI response received');

    const analysisText = response.choices[0].message.content;
    
    // Extract JSON from response (in case there's extra text)
    let analysisData;
    try {
      // Try to find JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', analysisText);
      return res.status(500).json({ 
        error: 'AI 응답 파싱 오류',
        details: 'OpenAI 응답을 처리하는 중 오류가 발생했습니다.',
        rawResponse: analysisText
      });
    }

    // Return the analysis result
    res.json({
      success: true,
      data: analysisData,
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

// Test endpoint with API key validation
app.get('/api/test', async (req, res) => {
  try {
    // Test OpenAI connection
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
