# 🌐 Netlify 배포 가이드

## 📋 개요

이 프로젝트를 GitHub + Netlify로 배포하는 완전한 가이드입니다.

**구조:**
- **프론트엔드**: Netlify 정적 호스팅
- **백엔드**: Netlify Functions (Serverless)
- **모두 하나의 Netlify 사이트에서 실행!**

---

## 🚀 배포 단계

### 1️⃣ GitHub에 코드 업로드

#### GitHub 저장소 생성
1. [GitHub.com](https://github.com) 로그인
2. 우측 상단 **+** → **New repository**
3. Repository 이름: `medical-report-analyzer`
4. Public/Private 선택
5. **Create repository** 클릭

#### 로컬 프로젝트 업로드

```bash
# 프로젝트 폴더로 이동
cd medical-report-analyzer

# Git 초기화 (아직 안했다면)
git init
git add .
git commit -m "Initial commit for Netlify deployment"

# GitHub 저장소 연결 (본인 URL로 변경)
git remote add origin https://github.com/your-username/medical-report-analyzer.git
git branch -M main
git push -u origin main
```

✅ **GitHub에 업로드 완료!**

---

### 2️⃣ Netlify에 배포

#### Netlify 계정 생성 및 사이트 생성

1. **[Netlify](https://www.netlify.com) 접속**
2. **Sign up** (GitHub 계정으로 로그인 권장)
3. **Add new site** → **Import an existing project** 클릭
4. **GitHub** 선택
5. 저장소 `medical-report-analyzer` 선택

#### 빌드 설정

Netlify가 자동으로 `netlify.toml` 파일을 감지합니다:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Functions directory**: `netlify/functions`

→ **Deploy site** 클릭!

---

### 3️⃣ 환경 변수 설정

배포가 시작되면 **일단 실패합니다** (OpenAI API 키가 없어서).

#### OpenAI API 키 추가

1. Netlify Dashboard에서 사이트 선택
2. **Site settings** → **Environment variables** 클릭
3. **Add a variable** 클릭
4. 다음 환경 변수 추가:

```
Key: OPENAI_API_KEY
Value: sk-your-actual-openai-api-key-here
Scopes: All scopes 선택
```

5. **Save** 클릭

#### 재배포

1. **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭

✅ **배포 완료! 약 2-3분 소요**

---

### 4️⃣ 배포 확인

#### 사이트 URL 확인

Netlify가 자동으로 생성한 URL:
```
https://random-name-12345.netlify.app
```

#### 기능 테스트

1. **사이트 접속** - 로딩 확인
2. **다크모드** - ☀️/🌙 토글 작동 확인
3. **파일 업로드** - 테스트 이미지 업로드
4. **분석 실행** - OpenAI API 호출 확인
5. **결과 다운로드** - 텍스트/Excel/PDF 다운로드

---

## 🔧 커스텀 도메인 설정 (선택사항)

### 본인 도메인 연결

1. **Domain settings** 클릭
2. **Add custom domain** 클릭
3. 도메인 입력 (예: `medical-analyzer.com`)
4. DNS 설정 안내에 따라 도메인 제공업체에서 설정
5. 자동 HTTPS 인증서 발급됨

---

## 📊 프로젝트 구조 (Netlify용)

```
medical-report-analyzer/
├── netlify.toml                 # Netlify 설정 파일
├── netlify/
│   └── functions/               # Netlify Functions (백엔드)
│       ├── analyze.js           # OpenAI 분석 API
│       └── package.json         # Functions 의존성
│
└── frontend/                    # React 프론트엔드
    ├── src/
    ├── package.json
    └── dist/ (빌드 후 생성)
```

---

## 🔄 자동 배포 설정

### GitHub 연동 완료!

**이제부터는 Git Push만 하면 자동 배포됩니다:**

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push

# Netlify가 자동으로 감지하고 재배포!
```

### 배포 상태 확인

- Netlify Dashboard → **Deploys** 탭
- 실시간 빌드 로그 확인
- 배포 성공/실패 알림

---

## 💰 Netlify 무료 플랜 제한

### 무료 플랜 포함사항
- ✅ **100GB 대역폭**/월
- ✅ **300분 빌드 시간**/월
- ✅ **125,000 Serverless 함수 요청**/월
- ✅ 무제한 사이트
- ✅ 자동 HTTPS
- ✅ 자동 배포

### 예상 사용량 (개인 프로젝트)
- 월 100회 분석: **충분함** ✅
- 월 1,000회 분석: **무료 플랜으로 가능** ✅

### OpenAI API 비용 (별도)
- 이미지당: $0.01-0.03
- 월 100회: ~$1-3

---

## 🐛 문제 해결

### 1. "Function invocation failed"

**원인:** OpenAI API 키가 설정되지 않음

**해결:**
1. Site settings → Environment variables
2. `OPENAI_API_KEY` 확인
3. 재배포

### 2. "Build failed"

**원인:** Node.js 버전 문제 또는 의존성 오류

**해결:**
```bash
# 로컬에서 빌드 테스트
cd frontend
npm install
npm run build

# 성공하면 Git 커밋
git add .
git commit -m "Fix build"
git push
```

### 3. CORS 오류

**원인:** API 경로 문제

**해결:**
- `netlify.toml` 파일의 redirects 확인
- 프론트엔드 `api.ts`에서 API_BASE_URL 확인

### 4. 분석이 느림

**원인:** Netlify Functions Cold Start

**해결:** 
- 첫 요청은 느릴 수 있음 (10-15초)
- 이후 요청은 빠름 (3-5초)
- Pro 플랜으로 업그레이드하면 개선됨

---

## 📈 배포 후 최적화

### 1. 성능 모니터링

Netlify Analytics (옵션, $9/월):
- 페이지 뷰 추적
- 성능 메트릭
- 사용자 위치

### 2. 함수 최적화

`netlify/functions/analyze.js` 수정:
- 타임아웃 증가
- 에러 핸들링 개선
- 로깅 추가

### 3. 캐싱 설정

`netlify.toml`에 추가:
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔒 보안 체크리스트

- ✅ OpenAI API 키는 환경 변수로만 관리
- ✅ Functions에서만 API 호출
- ✅ CORS 자동 설정됨
- ✅ HTTPS 자동 적용
- ✅ 파일 크기 제한 (10MB)
- ✅ Rate Limiting (Netlify Functions)

---

## 📱 Netlify CLI로 배포 (대안)

### CLI 설치

```bash
npm install -g netlify-cli
```

### CLI로 배포

```bash
# 로그인
netlify login

# 프로젝트 초기화
netlify init

# 배포
netlify deploy --prod
```

---

## 🎯 배포 완료 체크리스트

- [ ] GitHub 저장소 생성 및 코드 업로드
- [ ] Netlify 계정 생성
- [ ] GitHub 저장소 연결
- [ ] OpenAI API 키 환경 변수 설정
- [ ] 첫 배포 성공
- [ ] 사이트 접속 확인
- [ ] 파일 업로드 테스트
- [ ] AI 분석 테스트
- [ ] 결과 다운로드 테스트
- [ ] 다크모드 작동 확인
- [ ] 모바일 반응형 확인

---

## 📚 추가 리소스

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## 🎉 축하합니다!

의료 영상 판독 AI 시스템이 온라인에 배포되었습니다!

**배포된 사이트:**
```
https://your-site-name.netlify.app
```

**다음 단계:**
1. 커스텀 도메인 연결 (선택)
2. 실제 데이터로 테스트
3. 사용자 피드백 수집
4. 기능 개선 및 업데이트

---

**문제가 있으시면 README.md나 이 가이드를 참고해주세요!**
