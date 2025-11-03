# Medical Report Analyzer - Backend API

의료 영상 판독 결과를 OpenAI Vision API로 분석하는 백엔드 서버입니다.

## 📋 요구사항

- Node.js 18 이상
- OpenAI API 키

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 내용을 수정합니다:

```env
# OpenAI API Key (필수)
OPENAI_API_KEY=sk-your-actual-api-key-here

# 서버 포트 (선택사항, 기본값: 3001)
PORT=3001

# 프론트엔드 URL (CORS 설정)
FRONTEND_URL=http://localhost:5173

# 환경 설정
NODE_ENV=development
```

### 3. 서버 실행

**개발 모드 (자동 재시작):**
```bash
npm run dev
```

**프로덕션 모드:**
```bash
npm start
```

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
🚀 Medical Report API server running on port 3001
📍 Environment: development
🔑 OpenAI API Key configured: true
🌐 CORS enabled for: http://localhost:5173
```

## 📡 API 엔드포인트

### 1. Health Check
상태 확인 엔드포인트

```http
GET /health
```

**응답 예시:**
```json
{
  "status": "ok",
  "message": "Medical Report API is running"
}
```

### 2. OpenAI API 테스트
OpenAI API 연결 상태를 확인합니다.

```http
GET /api/test
```

**응답 예시:**
```json
{
  "status": "ok",
  "message": "OpenAI API 연결 성공",
  "apiKeyConfigured": true
}
```

### 3. 의료 결과지 분석 (주요 엔드포인트)
의료 영상 판독 결과지를 분석합니다.

```http
POST /api/analyze
Content-Type: multipart/form-data
```

**요청 파라미터:**
- `file` (required): 분석할 이미지 또는 PDF 파일
  - 지원 형식: JPG, PNG, PDF
  - 최대 크기: 10MB

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "patientInfo": {
      "patientId": "00002448",
      "name": "",
      "age": "70세",
      "gender": "F",
      "birthDate": ""
    },
    "examInfo": {
      "examType": "Brain MRI",
      "examPart": "뇌",
      "examDate": "2025-10-22",
      "hospital": "건국병원",
      "referringPhysician": "",
      "readingPhysician": "홍길동"
    },
    "findings": [
      {
        "category": "뇌실질",
        "description": "양측 대뇌반구에 경미한 백질 고신호 강도",
        "isNormal": false,
        "severity": "경증"
      }
    ],
    "impression": {
      "summary": "경미한 뇌혈관 변화 소견",
      "diagnosis": "죽상경화성 변화",
      "overallSeverity": "경증"
    },
    "medicalTerms": [
      {
        "term": "백질 고신호 강도",
        "explanation": "뇌의 백질 부분이 MRI에서 밝게 보이는 것으로, 노화나 혈관 변화로 인한 소견"
      }
    ],
    "recommendations": {
      "followUp": "정기 검진 권장",
      "department": "신경과",
      "urgency": "낮음",
      "notes": "혈압 관리 필요"
    }
  },
  "metadata": {
    "fileName": "medical-report.jpg",
    "fileSize": 245678,
    "analyzedAt": "2025-01-15T10:30:00.000Z",
    "model": "gpt-4o"
  }
}
```

**에러 응답 예시:**
```json
{
  "error": "파일이 업로드되지 않았습니다."
}
```

## 🔒 보안 기능

1. **Rate Limiting**: 15분당 최대 10회 요청 제한
2. **Helmet.js**: 보안 헤더 자동 설정
3. **CORS**: 지정된 프론트엔드 URL만 허용
4. **File Validation**: 파일 형식 및 크기 검증
5. **API Key Protection**: 환경 변수로 안전하게 관리

## 🌐 배포

### Vercel로 배포

1. Vercel 계정 생성 및 로그인
2. 프로젝트 루트에서 실행:

```bash
npm install -g vercel
vercel
```

3. 환경 변수 설정:
   - Vercel 대시보드에서 프로젝트 Settings > Environment Variables
   - `OPENAI_API_KEY` 추가

### Railway로 배포

1. Railway 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `OPENAI_API_KEY`
   - `PORT` (Railway가 자동 설정)
   - `NODE_ENV=production`

### Docker로 배포

```bash
# Dockerfile 생성
docker build -t medical-report-api .
docker run -p 3001:3001 --env-file .env medical-report-api
```

## 📊 API 사용량 모니터링

OpenAI API 사용량은 [OpenAI Platform](https://platform.openai.com/usage)에서 확인할 수 있습니다.

**예상 비용:**
- GPT-4o Vision: 이미지당 약 $0.01-0.03
- 월 100회 분석 시: 약 $1-3

## 🐛 문제 해결

### OpenAI API 키 오류
```
Error: OpenAI API 키 오류
```
→ `.env` 파일에서 `OPENAI_API_KEY`가 올바르게 설정되었는지 확인

### CORS 오류
```
Access to fetch at 'http://localhost:3001/api/analyze' from origin 'http://localhost:5173' has been blocked by CORS policy
```
→ `.env` 파일에서 `FRONTEND_URL`이 프론트엔드 URL과 일치하는지 확인

### 파일 업로드 오류
```
Error: 파일 크기가 10MB를 초과합니다.
```
→ 이미지를 압축하거나 더 작은 파일 사용

## 📄 라이선스

MIT License
