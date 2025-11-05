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

⚠️ 중요: 당신은 진단 도구가 아닌 "보조 분석 도구"입니다.

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
          "영상에서 실제로 관찰된 특징 1",
          "영상에서 실제로 관찰된 특징 2",
          "영상에서 실제로 관찰된 특징 3"
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
        "observedFeatures": 
