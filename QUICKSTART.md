# ⚡ 빠른 시작 가이드

## 🎯 5분 안에 실행하기

### 필수 준비물
- ✅ Node.js 18 이상 설치됨
- ✅ OpenAI API 키 ([발급 받기](https://platform.openai.com/api-keys))

---

## 🚀 실행 방법

### 1️⃣ 프로젝트 다운로드 및 압축 해제

```bash
# ZIP 파일 다운로드 후
unzip medical-report-analyzer.zip
cd medical-report-analyzer
```

### 2️⃣ 백엔드 실행 (터미널 1)

```bash
cd backend
npm install
cp .env.example .env
```

**중요:** `.env` 파일을 열어서 OpenAI API 키를 입력하세요:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

그 다음 서버를 시작:
```bash
npm start
```

✅ `🚀 Medical Report API server running on port 3001` 메시지가 보이면 성공!

### 3️⃣ 프론트엔드 실행 (터미널 2 - 새 터미널 열기)

```bash
cd frontend
npm install
npm run dev
```

✅ `Local: http://localhost:5173` 메시지가 보이면 성공!

### 4️⃣ 브라우저에서 접속

브라우저를 열고 **http://localhost:5173** 접속

---

## 🎨 기능 테스트

### 1. 다크모드 전환
우측 상단의 ☀️/🌙 아이콘 클릭

### 2. 파일 업로드
- **PC**: 파일을 드래그 앤 드롭하거나 클릭하여 선택
- **모바일**: 📷 카메라 촬영 또는 📁 파일 선택

### 3. 분석 결과 확인
- 환자 정보, 검사 정보 확인
- 상세 소견 및 판독 의견 읽기
- 의학 용어 쉬운 설명 보기
- 권장 조치사항 확인

### 4. 결과 다운로드
- 📄 텍스트 버튼: 텍스트 파일로 저장
- 📊 Excel 버튼: 엑셀 파일로 저장
- 📑 PDF 버튼: PDF 리포트로 저장

---

## 🐛 문제 해결

### "OpenAI API 키 오류"
→ `backend/.env` 파일을 열어서 `OPENAI_API_KEY=sk-...` 값이 올바른지 확인

### "Network Error"
→ 백엔드가 실행 중인지 확인 (터미널 1에서 서버 실행 중?)

### 포트 충돌 오류
→ 다른 프로그램이 3001 또는 5173 포트를 사용 중일 수 있음
```bash
# 포트 사용 중인 프로세스 종료 (Mac/Linux)
kill -9 $(lsof -ti:3001)
kill -9 $(lsof -ti:5173)

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID번호> /F
```

---

## 📦 Docker로 실행 (대안)

Docker가 설치되어 있다면:

```bash
# .env 파일 설정
cd backend
cp .env.example .env
# OpenAI API 키 입력

# Docker Compose로 실행
cd ..
docker-compose up
```

접속: **http://localhost:8080**

---

## 💡 팁

### OpenAI API 키 발급 방법
1. [OpenAI Platform](https://platform.openai.com) 접속
2. 로그인 또는 회원가입
3. API Keys 메뉴 클릭
4. "Create new secret key" 클릭
5. 생성된 키를 복사하여 `.env` 파일에 입력

### 비용 관리
- OpenAI API 사용량: [Usage 페이지](https://platform.openai.com/usage)
- 예상 비용: 이미지당 $0.01-0.03
- 월 사용 한도 설정 권장

### 개발 팁
- 백엔드 수정 시: 서버 재시작 필요 (`Ctrl+C` 후 `npm start`)
- 프론트엔드 수정 시: 자동으로 새로고침됨 (Hot reload)

---

## 📚 추가 문서

- [전체 README](README.md) - 프로젝트 전체 정보
- [배포 가이드](DEPLOYMENT.md) - 프로덕션 배포 방법
- [백엔드 문서](backend/README.md) - API 상세 설명
- [프론트엔드 문서](frontend/README.md) - UI 컴포넌트 정보

---

## 🎉 축하합니다!

의료 영상 판독 AI 시스템이 정상적으로 실행되었습니다!

**다음 단계:**
1. 실제 의료 결과지로 테스트해보기
2. 다크모드 및 반응형 디자인 확인
3. 결과 다운로드 기능 사용해보기
4. [배포 가이드](DEPLOYMENT.md) 참고하여 온라인 배포

**문제가 있나요?**
- README.md의 "문제 해결" 섹션 확인
- 백엔드/프론트엔드 로그 확인

---

**즐거운 개발 되세요! 🚀**
