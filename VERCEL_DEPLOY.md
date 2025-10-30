# Vercel 배포 가이드

이 문서는 테트리스 게임을 Vercel에 배포하는 방법을 설명합니다.

## 🚀 Vercel 배포 방법

### 방법 1: GitHub 연동 (권장)

1. **GitHub 저장소 준비**
   - 이미 GitHub에 푸시되어 있어야 합니다
   - https://github.com/TAEYEON7731/game

2. **Vercel 사이트 접속**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

3. **새 프로젝트 만들기**
   - "New Project" 또는 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택: `TAEYEON7731/game`
   - "Import" 클릭

4. **프로젝트 설정**
   - **Framework Preset**: Other (또는 선택 안 함)
   - **Root Directory**: `테트리스` (폴더 선택)
   - **Build Command**: 비워두거나 `echo 'No build'`
   - **Output Directory**: `.` (현재 디렉토리)
   - **Install Command**: 비워두기

5. **환경 변수 설정 (Google Sheets 사용 시)**
   - "Environment Variables" 섹션에서 추가:
     ```
     GOOGLE_SHEETS_API_KEY = 여기에_API_키_입력
     GOOGLE_SHEETS_SPREADSHEET_ID = 여기에_스프레드시트_ID_입력
     GOOGLE_SHEETS_SHEET_NAME = 테트리스점수
     GOOGLE_SHEETS_ENABLED = true
     ```

6. **배포**
   - "Deploy" 버튼 클릭
   - 몇 분 후 배포 완료!

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 프로젝트 폴더로 이동
cd c:\Users\admin\Desktop\game\테트리스

# Vercel 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 📝 중요 사항

### 1. Google Sheets API 사용 시

Vercel에서는 브라우저에서 직접 Google Sheets API를 호출합니다.
- API 키가 클라이언트에 노출됩니다
- 반드시 API 키 제한을 설정하세요:
  - HTTP 리퍼러 제한 추가
  - Vercel 도메인만 허용 (예: `*.vercel.app/*`)

### 2. CORS 설정

Google Sheets API는 브라우저에서 직접 호출되므로 CORS 문제가 없습니다.

### 3. 정적 파일 호스팅

- Vercel은 정적 파일만 호스팅합니다
- `server.js`는 배포되지 않습니다 (`.vercelignore`에 포함)
- HTML, CSS, JavaScript 파일만 배포됩니다

## 🔧 문제 해결

### 배포는 성공했는데 페이지가 안 보여요
- Root Directory 설정 확인: `테트리스` 폴더가 선택되어야 합니다
- 브라우저 캐시 삭제 후 재시도

### Google Sheets에 저장이 안 돼요
1. 환경 변수가 올바르게 설정되었는지 확인
2. API 키 제한 설정 확인 (HTTP 리퍼러)
3. 스프레드시트 공유 설정 확인 ("링크가 있는 모든 사용자" + "편집자")

### 404 에러가 나요
- `vercel.json` 파일이 제대로 배포되었는지 확인
- Vercel 대시보드에서 배포 로그 확인

## 🎯 배포 후 확인사항

1. ✅ 게임이 정상적으로 로드되는지
2. ✅ 블록이 정상적으로 움직이는지
3. ✅ 모바일에서도 잘 작동하는지
4. ✅ Google Sheets에 점수가 저장되는지

## 🔗 유용한 링크

- [Vercel 문서](https://vercel.com/docs)
- [Vercel 대시보드](https://vercel.com/dashboard)
- [Google Sheets API 문서](https://developers.google.com/sheets/api)

## 📱 커스텀 도메인 연결 (선택사항)

1. Vercel 프로젝트 설정 → "Domains" 탭
2. 본인 도메인 입력
3. DNS 설정 업데이트
4. SSL 인증서 자동 적용 완료!
