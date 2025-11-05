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
        "observedFeatures": ["관찰된 특징들"],
        "references": ["참조 기준"],
        "nextSteps": ["권장 조치"]
      }
    ]
  },
  
  "medicalTerms": [
    {
      "term": "영문 의학 용어",
      "koreanTerm": "한글 음역",
      "koreanName": "한글 정식 명칭",
      "simpleExplanation": "일반인이 이해할 수 있는 쉬운 설명",
      "detailedExplanation": "좀 더 자세한 설명 (3-5문장)",
      "patientContext": "이 환자의 경우 어떤 의미인지",
      "whatToDo": "환자가 해야 할 일",
      "analogy": "비유를 통한 설명 (선택사항)"
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
              "reason": "왜 이 검사가 필요한지",
              "fastingRequired": true/false,
              "fastingHours": 8,
              "estimatedCost": "30,000-50,000원",
              "insuranceCovered": true/false,
              "timeRequired": "당일 채혈, 3-5일 결과",
              "priority": "⭐⭐⭐⭐⭐"
            }
          ]
        },
        {
          "category": "추가 권장 - 예약 필요",
          "tests": [...]
        }
      ],
      "preparationChecklist": [
        {
          "item": "준비물 항목",
          "importance": "필수/권장",
          "reason": "왜 필요한지",
          "howToGet": "어디서/어떻게 준비하는지"
        }
      ],
      "timeline": [
        {
          "day": "Day 1",
          "action": "신경과/내과 초진",
          "details": "의사가 MRI 확인 + 검사 지시"
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
        "일반병원에서 협착 50% 이상 진단 시",
        "어지럼증, 언어장애 등 증상 있을 시"
      ],
      "recommendedDepartments": [
        {
          "department": "신경과",
          "priority": "1순위",
          "reason": "뇌혈관 전문"
        }
      ],
      "recommendedHospitals": [
        {
          "name": "서울대병원",
          "specialty": "뇌혈관센터"
        }
      ],
      "additionalDocuments": [
        {
          "document": "진료 의뢰서",
          "importance": "매우 중요",
          "reason": "없으면 본인 부담금 2배 증가",
          "howToGet": "일반병원 진료 시 의사에게 요청",
          "template": "Brain MRI상 cerebral atherosclerosis 소견으로..."
        }
      ],
      "expectedAdditionalTests": [
        {
          "name": "DSA (뇌혈관 조영술)",
          "englishName": "Digital Subtraction Angiography",
          "when": "협착 정도 정확히 측정 필요 시",
          "cost": "1,000,000-2,000,000원",
          "insuranceCovered": true,
          "invasive": true
        }
      ],
      "questionsToAsk": [
        "협착 정도가 정확히 몇 %인가요?",
        "지금 치료가 필요한가요, 추적 관찰인가요?",
        "어떤 추가 검사가 필요한가요?",
        "약물 치료 효과는 어느 정도인가요?",
        "다음 추적 검사는 언제 해야 하나요?"
      ],
      "insuranceTips": [
        {
          "tip": "진료 의뢰서 필수",
          "benefit": "본인 부담 30-50% (vs 없으면 60-80%)"
        },
        {
          "tip": "검사 사전 승인 (실손보험)",
          "benefit": "사후 청구 거절 방지"
        }
      ],
      "timeline": [
        {
          "week": "Week 1",
          "action": "일반병원 검사 완료 + 진료 의뢰서 발급"
        },
        {
          "week": "Week 2",
          "action": "대학병원 예약 (보통 2-4주 대기)"
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
3. 모든 비용은 "30,000-50,000원" 형식으로 범위 표시
4. 의학 용어는 최소 5-7개 상세히 설명
5. 영상에서 보이는 구체적 특징만 observedFeatures에 포함`;

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
              text: `다음 의료 영상을 분석해주세요.

환자 정보:
- 이름: ${patientName || '정보 없음'}
- 환자번호: ${patientId || '정보 없음'}
- 검사일: ${examDate || '정보 없음'}
- 검사 종류: ${examType || '정보 없음'}

위 JSON 형식에 맞춰 상세한 분석을 제공해주세요.
특히 medicalTerms는 최소 5-7개를 포함하고, 각각 일반인이 이해할 수 있도록 쉽게 설명해주세요.`
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
      max_tokens: 4096,
      temperature: 0.3
    });

    console.log('OpenAI 응답 수신');

    const content = response.choices[0].message.content;
    
        // JSON 추출 (개선된 버전)
    let analysisResult;
    try {
      // 1. 먼저 ```json 코드 블록 제거
      let cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // 2. JSON 부분만 추출
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // JSON을 찾을 수 없으면 원본 응답 로그 출력
        console.error('OpenAI 원본 응답:', content.substring(0, 500));
        throw new Error('JSON 형식을 찾을 수 없습니다');
      }
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      console.error('응답 내용 샘플:', content.substring(0, 300));
      return res.status(500).json({ 
        error: 'AI 응답 파싱 실패. 다시 시도해주세요.',
        details: parseError.message 
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
