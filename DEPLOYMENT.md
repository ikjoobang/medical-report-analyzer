# 🚀 배포 가이드

## 목차
- [로컬 개발 환경](#로컬-개발-환경)
- [Docker로 배포](#docker로-배포)
- [Vercel 배포](#vercel-배포)
- [Railway 배포](#railway-배포)
- [Netlify 배포](#netlify-배포)
- [AWS 배포](#aws-배포)

---

## 로컬 개발 환경

### 1. 백엔드 실행

```bash
cd backend
npm install
cp .env.example .env
# .env 파일에 OpenAI API 키 입력
npm start
```

백엔드: `http://localhost:3001`

### 2. 프론트엔드 실행 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

프론트엔드: `http://localhost:5173`

---

## Docker로 배포

### 방법 1: Docker Compose (권장)

```bash
# 1. .env 파일 설정
cd backend
cp .env.example .env
# OpenAI API 키 입력

# 2. Docker Compose로 실행
cd ..
docker-compose up -d

# 3. 로그 확인
docker-compose logs -f

# 4. 중지
docker-compose down
```

**접속:**
- 프론트엔드: `http://localhost:8080`
- 백엔드: `http://localhost:3001`

### 방법 2: 개별 Docker 실행

**백엔드:**
```bash
cd backend
docker build -t medical-report-backend .
docker run -p 3001:3001 --env-file .env medical-report-backend
```

**프론트엔드:**
```bash
cd frontend
docker build -t medical-report-frontend .
docker run -p 8080:80 medical-report-frontend
```

---

## Vercel 배포

### 백엔드 (Vercel Serverless)

1. **Vercel 설치 및 로그인:**
```bash
npm install -g vercel
vercel login
```

2. **백엔드 배포:**
```bash
cd backend
vercel
```

3. **환경 변수 설정:**
   - Vercel Dashboard → Settings → Environment Variables
   - `OPENAI_API_KEY`: OpenAI API 키
   - `FRONTEND_URL`: 프론트엔드 URL (배포 후)
   - `NODE_ENV`: `production`

4. **프로덕션 배포:**
```bash
vercel --prod
```

### 프론트엔드 (Vercel)

1. **프론트엔드 배포:**
```bash
cd frontend
vercel
```

2. **환경 변수 설정:**
   - `VITE_API_URL`: 배포된 백엔드 URL

3. **프로덕션 배포:**
```bash
vercel --prod
```

---

## Railway 배포

### 1. Railway 계정 생성
[Railway.app](https://railway.app) 가입 및 GitHub 연결

### 2. 새 프로젝트 생성

**백엔드:**
1. New Project → Deploy from GitHub repo
2. 저장소 선택
3. Root directory: `/backend`
4. 환경 변수 설정:
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`
   - `PORT` (Railway가 자동 설정)
5. Deploy

**프론트엔드:**
1. New Service → Deploy from GitHub repo
2. 저장소 선택
3. Root directory: `/frontend`
4. Build command: `npm run build`
5. Start command: `npx vite preview --host --port $PORT`
6. 환경 변수:
   - `VITE_API_URL`: 백엔드 Railway URL
7. Deploy

---

## Netlify 배포

### 프론트엔드 (Netlify)

1. **Netlify CLI 설치:**
```bash
npm install -g netlify-cli
```

2. **빌드:**
```bash
cd frontend
npm run build
```

3. **배포:**
```bash
netlify deploy --prod --dir=dist
```

4. **환경 변수 설정 (Netlify Dashboard):**
   - `VITE_API_URL`: 백엔드 URL

### netlify.toml 파일 (자동 배포용)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "frontend"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## AWS 배포

### 백엔드 (AWS Elastic Beanstalk)

1. **EB CLI 설치:**
```bash
pip install awsebcli
```

2. **초기화:**
```bash
cd backend
eb init -p node.js-18 medical-report-backend
```

3. **환경 생성 및 배포:**
```bash
eb create production
eb setenv OPENAI_API_KEY=your-key NODE_ENV=production
eb deploy
```

### 프론트엔드 (AWS S3 + CloudFront)

1. **빌드:**
```bash
cd frontend
npm run build
```

2. **S3 버킷 생성 및 정적 웹 호스팅 설정**

3. **빌드 파일 업로드:**
```bash
aws s3 sync dist/ s3://your-bucket-name/
```

4. **CloudFront 배포 생성** (선택사항, CDN)

---

## 환경 변수 체크리스트

### 백엔드 필수 환경 변수
- ✅ `OPENAI_API_KEY`: OpenAI API 키
- ✅ `PORT`: 서버 포트 (기본값: 3001)
- ✅ `FRONTEND_URL`: 프론트엔드 URL (CORS)
- ✅ `NODE_ENV`: production

### 프론트엔드 필수 환경 변수
- ✅ `VITE_API_URL`: 백엔드 API URL

---

## 배포 후 확인사항

### 1. Health Check
```bash
curl https://your-backend-url.com/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Medical Report API is running"
}
```

### 2. API Test
```bash
curl https://your-backend-url.com/api/test
```

예상 응답:
```json
{
  "status": "ok",
  "message": "OpenAI API 연결 성공",
  "apiKeyConfigured": true
}
```

### 3. 프론트엔드 접속
브라우저에서 프론트엔드 URL 접속 후:
- ✅ 페이지 로딩 확인
- ✅ 다크모드 토글 작동 확인
- ✅ 파일 업로드 UI 확인
- ✅ 샘플 파일로 분석 테스트

---

## 문제 해결

### OpenAI API 키 오류
```bash
# 환경 변수 확인
echo $OPENAI_API_KEY

# Vercel/Netlify: Dashboard에서 환경 변수 재확인
# Railway: Settings → Variables 확인
```

### CORS 오류
백엔드 `.env` 파일의 `FRONTEND_URL`이 배포된 프론트엔드 URL과 일치하는지 확인

### 502 Bad Gateway (백엔드)
- 백엔드 서버가 정상 실행 중인지 확인
- 로그 확인: `docker logs [container-id]`
- Health check 엔드포인트 확인

### 빌드 실패
```bash
# 캐시 삭제 후 재시도
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 성능 최적화

### 백엔드
- Rate Limiting 조정 (`.env`: `RATE_LIMIT_MAX_REQUESTS`)
- 이미지 압축 처리
- Redis 캐싱 추가 (선택사항)

### 프론트엔드
- 이미지 lazy loading
- Code splitting
- Service Worker (PWA)

---

## 모니터링

### OpenAI API 사용량
[OpenAI Platform](https://platform.openai.com/usage) → Usage

### 서버 모니터링
- Vercel: Dashboard → Analytics
- Railway: Dashboard → Metrics
- AWS: CloudWatch

---

## 비용 예상

### OpenAI API
- 이미지당: $0.01 - $0.03
- 월 100회: ~$1-3
- 월 1,000회: ~$10-30

### 호스팅
- **Vercel**: 무료 (Hobby), $20/월 (Pro)
- **Railway**: $5/월 (500시간), 사용량 기반
- **Netlify**: 무료 (100GB/월), $19/월 (Pro)
- **AWS**: 사용량 기반 (~$10-50/월)

---

## 보안 체크리스트

- ✅ API 키는 환경 변수로만 관리
- ✅ CORS 설정 (허용된 도메인만)
- ✅ Rate Limiting 활성화
- ✅ HTTPS 사용 (프로덕션)
- ✅ Helmet.js 보안 헤더
- ✅ 파일 크기 제한 (10MB)
- ✅ 파일 형식 검증

---

## 백업 및 복구

### 데이터 백업
현재 서버에 데이터 저장 안 함 (분석 후 즉시 삭제)

### 코드 백업
- GitHub 저장소 정기 백업
- Tag/Release 버전 관리

---

**배포 성공을 기원합니다! 🚀**
