# Medical Report Analyzer - Frontend

React + TypeScript 기반의 의료 영상 판독 분석 웹 애플리케이션입니다.

## 🎨 주요 기능

### 1. 반응형 디자인
- **모바일 최적화**: 카메라 촬영, 터치 친화적 UI
- **태블릿 지원**: 2-column 레이아웃
- **데스크톱**: 3-column Gallery 레이아웃
- **다크모드**: 라이트/다크 테마 전환 (☀️/🌙)

### 2. 파일 업로드
- **PC**: 드래그 앤 드롭 + 파일 탐색기
- **모바일**: 카메라 직접 촬영 + 갤러리 선택
- **지원 형식**: JPG, PNG, PDF (최대 10MB)
- **실시간 미리보기**

### 3. AI 분석
- OpenAI Vision API 연동
- 실시간 분석 상태 표시
- 구조화된 판독 결과

### 4. 결과 출력
- **텍스트**: 구조화된 텍스트 파일 다운로드
- **Excel**: 다중 시트로 정리된 스프레드시트
- **PDF**: 전문적인 리포트 형식

### 5. 히스토리
- 최근 분석 기록 저장 (로컬 스토리지)
- 빠른 재조회 기능

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
VITE_API_URL=http://localhost:3001
```

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 5. 빌드 미리보기

```bash
npm run preview
```

## 🎨 디자인 시스템

### Typography
- **폰트**: Poppins + Noto Sans KR
- **제목**: 48px (모바일: 32px)
- **부제목**: 20px (모바일: 16px)
- **본문**: 16px
- **줄높이**: 140%

### Colors

#### Light Mode
- **배경**: #F8F9FB
- **텍스트**: #333333
- **Primary**: #0891b2
- **Secondary**: #06b6d4

#### Dark Mode
- **배경**: #1a1a1a
- **텍스트**: #e5e5e5
- **Primary**: #22d3ee
- **Secondary**: #67e8f9

### Layout
- **Container**: Fluid (max-width: 1400px)
- **Spacing**: 16px / 24px
- **Gallery**: 3-column (모바일: 1-col, 태블릿: 2-col)

## 📱 반응형 브레이크포인트

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🛠️ 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Excel Export**: xlsx
- **PDF Export**: jsPDF + jsPDF-AutoTable
- **Fonts**: Google Fonts (Poppins, Noto Sans KR)

## 📦 프로젝트 구조

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx        # 파일 업로드 컴포넌트
│   │   ├── ResultsDisplay.tsx    # 결과 표시 컴포넌트
│   │   └── ThemeToggle.tsx       # 다크모드 토글
│   ├── hooks/
│   │   ├── useTheme.ts           # 테마 관리 훅
│   │   └── useLocalStorage.ts    # 로컬 스토리지 훅
│   ├── utils/
│   │   ├── api.ts                # API 호출 함수
│   │   └── export.ts             # 파일 출력 함수
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   ├── main.tsx                  # 엔트리 포인트
│   ├── index.css                 # 글로벌 스타일
│   └── types.ts                  # TypeScript 타입 정의
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🌐 배포

### Vercel 배포

1. Vercel CLI 설치:
```bash
npm install -g vercel
```

2. 배포:
```bash
vercel
```

3. 환경 변수 설정 (Vercel Dashboard):
   - `VITE_API_URL`: 백엔드 API URL

### Netlify 배포

1. `netlify.toml` 파일 생성:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Netlify CLI로 배포:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

3. 환경 변수 설정 (Netlify Dashboard):
   - `VITE_API_URL`: 백엔드 API URL

### Docker 배포

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

빌드 및 실행:
```bash
docker build -t medical-report-frontend .
docker run -p 8080:80 medical-report-frontend
```

## 🔧 커스터마이징

### 테마 색상 변경

`tailwind.config.js` 파일에서 색상 수정:

```js
colors: {
  primary: {
    DEFAULT: '#0891b2',  // 변경하고 싶은 색상
    dark: '#22d3ee',
  },
  // ... 기타 색상
}
```

### 폰트 변경

`index.html`의 Google Fonts 링크와 `tailwind.config.js`의 폰트 설정 수정

## 🐛 문제 해결

### API 연결 오류
```
Error: Network Error
```
→ 백엔드 서버가 실행 중인지 확인 (`http://localhost:3001`)

### CORS 오류
```
Access to fetch has been blocked by CORS policy
```
→ 백엔드 `.env` 파일의 `FRONTEND_URL` 확인

### 빌드 오류
```
Error: Cannot find module
```
→ `npm install` 재실행

## 📄 라이선스

MIT License

## 🤝 기여

버그 제보나 기능 제안은 GitHub Issues를 이용해주세요.
