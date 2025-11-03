# 🏥 Medical Report Analyzer - 의료 영상 판독 AI 분석 시스템

OpenAI Vision API를 활용한 전문적인 의료 영상 판독 결과 분석 웹 애플리케이션입니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)

## ✨ 주요 기능

### 🤖 AI 기반 자동 판독
- OpenAI GPT-4 Vision을 활용한 의료 결과지 자동 분석
- 환자 정보, 검사 정보, 소견, 판독 의견 자동 추출
- 의학 용어를 일반인이 이해할 수 있도록 쉽게 설명

### 📱 완벽한 반응형 디자인
- **모바일**: 카메라 직접 촬영, 1-column 레이아웃
- **태블릿**: 2-column 레이아웃
- **데스크톱**: 3-column Gallery 레이아웃, 드래그 앤 드롭
- **다크모드**: ☀️/🌙 아이콘으로 라이트/다크 테마 전환

### 📊 다중 포맷 출력
- **텍스트**: 구조화된 판독 결과
- **Excel**: 환자정보, 검사정보, 소견을 각 시트로 분리
- **PDF**: 전문적인 리포트 레이아웃

### 🔒 보안 및 개인정보 보호
- API 키는 서버 측에서만 관리
- 업로드된 파일은 분석 후 즉시 삭제
- 클라이언트 데이터는 브라우저 로컬 스토리지에만 저장

### 📈 추가 기능
- 분석 히스토리 관리 (최근 10건)
- 심각도 평가 (정상/경증/중등도/중증)
- 권장 조치사항 제공
- Rate Limiting으로 API 남용 방지

## 🎨 디자인 시스템

```css
/* Typography */
폰트: Poppins + Noto Sans KR
제목: 48px (모바일: 32px)
부제목: 20px (모바일: 16px)
줄높이: 140%

/* Colors - Light Mode */
배경: #F8F9FB
텍스트: #333333
Primary: #0891b2
Secondary: #06b6d4

/* Colors - Dark Mode */
배경: #1a1a1a
텍스트: #e5e5e5
Primary: #22d3ee
Secondary: #67e8f9

/* Layout */
Container: Fluid (max-width: 1400px)
Gallery: 3-column (모바일: 1-col, 태블릿: 2-col)
Spacing: 16px / 24px
```

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18 이상
- **npm** 또는 **yarn**
- **OpenAI API Key** ([발급 받기](https://platform.openai.com/api-keys))

### 1. 저장소 클론

```bash
git clone <repository-url>
cd medical-report-analyzer
```

### 2. 백엔드 설정 및 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 OpenAI API 키 입력:
# OPENAI_API_KEY=sk-your-actual-api-key-here

# 서버 실행
npm start
```

백엔드가 `http://localhost:3001`에서 실행됩니다.

### 3. 프론트엔드 설정 및 실행

**새 터미널 창을 열어서:**

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정 (선택사항, 기본값 사용 가능)
cp .env.example .env

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 4. 브라우저에서 접속

브라우저를 열고 `http://localhost:5173`으로 접속합니다.

## 📁 프로젝트 구조

```
medical-report-analyzer/
├── backend/                    # Node.js + Express 백엔드
│   ├── server.js              # 메인 서버 파일
│   ├── package.json
│   ├── .env.example           # 환경 변수 예시
│   └── README.md
│
├── frontend/                   # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   ├── hooks/             # Custom Hooks
│   │   ├── utils/             # 유틸리티 함수
│   │   ├── App.tsx            # 메인 앱
│   │   └── types.ts           # TypeScript 타입
│   ├── package.json
│   └── README.md
│
└── README.md                   # 이 파일
```

## 🔧 설정

### 백엔드 환경 변수 (backend/.env)

```env
# OpenAI API Key (필수)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 서버 포트
PORT=3001

# 프론트엔드 URL (CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15분
RATE_LIMIT_MAX_REQUESTS=10     # 최대 10회
```

### 프론트엔드 환경 변수 (frontend/.env)

```env
# 백엔드 API URL
VITE_API_URL=http://localhost:3001
```

## 📡 API 엔드포인트

### POST /api/analyze
의료 결과지를 분석합니다.

**요청:**
```http
POST /api/analyze
Content-Type: multipart/form-data

file: [이미지 또는 PDF 파일]
```

**응답:**
```json
{
  "success": true,
  "data": {
    "patientInfo": { ... },
    "examInfo": { ... },
    "findings": [ ... ],
    "impression": { ... },
    "medicalTerms": [ ... ],
    "recommendations": { ... }
  },
  "metadata": {
    "fileName": "report.jpg",
    "fileSize": 245678,
    "analyzedAt": "2025-01-15T10:30:00.000Z",
    "model": "gpt-4o"
  }
}
```

### GET /health
서버 상태를 확인합니다.

### GET /api/test
OpenAI API 연결을 테스트합니다.

## 🌐 배포 가이드

### 백엔드 배포

#### Vercel Serverless Functions

1. `vercel.json` 생성:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

2. 배포:
```bash
cd backend
vercel --prod
```

3. 환경 변수 설정 (Vercel Dashboard):
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`

#### Railway 배포

1. [Railway](https://railway.app)에 GitHub 저장소 연결
2. 환경 변수 설정:
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`
3. 자동 배포 완료

#### Docker 배포

```bash
cd backend
docker build -t medical-report-api .
docker run -p 3001:3001 --env-file .env medical-report-api
```

### 프론트엔드 배포

#### Vercel 배포

```bash
cd frontend
vercel --prod
```

환경 변수: `VITE_API_URL` (배포된 백엔드 URL)

#### Netlify 배포

```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

환경 변수: `VITE_API_URL`

## 💰 비용 안내

### OpenAI API 예상 비용

- **GPT-4 Vision**: 이미지당 약 $0.01 - $0.03
- **월 100회 분석**: 약 $1 - $3
- **월 1,000회 분석**: 약 $10 - $30

[OpenAI Pricing 페이지](https://openai.com/pricing)에서 최신 가격 확인

### Rate Limiting

기본 설정: 15분당 10회 요청 제한 (악용 방지)

## 🐛 문제 해결

### "OpenAI API 키 오류"
→ `backend/.env` 파일에서 `OPENAI_API_KEY` 확인

### "Network Error" 또는 "CORS 오류"
→ 백엔드 서버가 실행 중인지 확인
→ `backend/.env`의 `FRONTEND_URL`이 올바른지 확인

### "파일 크기가 10MB를 초과합니다"
→ 이미지를 압축하거나 더 작은 파일 사용

### 분석 결과가 부정확할 때
→ 이미지가 선명하고 글자가 잘 보이는지 확인
→ PDF보다 이미지 파일이 더 정확할 수 있음

## ⚠️ 중요 면책 조항

**이 애플리케이션은 의료 정보 참고용으로만 제공됩니다.**

- AI 분석 결과는 전문 의료인의 진단을 대체할 수 없습니다
- 정확한 진단과 치료를 위해서는 반드시 의료 전문가와 상담하세요
- 이 서비스 사용으로 인한 의료적 결정에 대해 책임지지 않습니다

## 🔒 보안 및 개인정보

- 업로드된 파일은 서버에 저장되지 않음
- OpenAI API 호출 후 즉시 삭제
- API 키는 환경 변수로 안전하게 관리
- Rate Limiting으로 남용 방지
- CORS 정책으로 허가된 도메인만 접근 가능

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

## 🤝 기여

버그 제보, 기능 제안, Pull Request 환영합니다!

## 📧 문의

프로젝트 관련 문의는 GitHub Issues를 이용해주세요.

---

**Made with ❤️ using OpenAI Vision API**
