# Google Sheets API 설정 가이드

이 문서는 테트리스 게임의 점수를 Google Sheets에 자동으로 저장하는 기능을 설정하는 방법을 설명합니다.

## 1단계: Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다
2. 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다

### 1.2 Google Sheets API 활성화
1. 좌측 메뉴에서 "API 및 서비스" > "라이브러리"를 선택합니다
2. "Google Sheets API"를 검색합니다
3. "Google Sheets API"를 클릭하고 "사용" 버튼을 클릭합니다

### 1.3 API 키 생성
1. 좌측 메뉴에서 "API 및 서비스" > "사용자 인증 정보"를 선택합니다
2. "사용자 인증 정보 만들기" > "API 키"를 클릭합니다
3. 생성된 API 키를 복사합니다

## 2단계: Google Sheets 준비

### 2.1 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com/)에서 새 스프레드시트를 생성합니다
2. 시트 이름을 "테트리스점수"로 변경합니다 (또는 원하는 이름 사용)

### 2.2 헤더 설정
첫 번째 행에 다음 헤더를 입력합니다:
- A1: 날짜
- B1: 점수
- C1: 레벨
- D1: 라인

### 2.3 스프레드시트 ID 확인
스프레드시트 URL에서 ID를 복사합니다:
```
https://docs.google.com/spreadsheets/d/[여기가_스프레드시트_ID]/edit
```

### 2.4 공유 설정
1. 스프레드시트 우측 상단의 "공유" 버튼을 클릭합니다
2. "일반 액세스"를 "링크가 있는 모든 사용자"로 변경합니다
3. 권한을 "편집자"로 설정합니다

## 3단계: 코드 설정

### 3.1 config.js 파일 수정
`config.js` 파일을 열고 다음 값을 수정합니다:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    // 1단계에서 생성한 API 키를 여기에 입력
    API_KEY: 'YOUR_API_KEY_HERE',

    // 2단계에서 확인한 스프레드시트 ID를 여기에 입력
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // 시트 이름 (기본값: '테트리스점수')
    SHEET_NAME: '테트리스점수',

    // API 설정이 완료되면 true로 변경
    ENABLED: true
};
```

## 4단계: 테스트

### 4.1 게임 실행
1. `index.html` 파일을 웹 브라우저로 엽니다
2. 게임을 시작하고 게임 오버가 될 때까지 플레이합니다

### 4.2 데이터 확인
1. Google Sheets를 새로고침합니다
2. 점수가 자동으로 추가되었는지 확인합니다

## 문제 해결

### API 키 오류
- API 키가 올바르게 입력되었는지 확인하세요
- Google Cloud Console에서 Google Sheets API가 활성화되어 있는지 확인하세요

### 스프레드시트 접근 오류
- 스프레드시트가 "링크가 있는 모든 사용자"에게 공유되어 있는지 확인하세요
- 스프레드시트 ID가 올바르게 입력되었는지 확인하세요

### 시트 이름 오류
- config.js의 SHEET_NAME이 실제 시트 이름과 일치하는지 확인하세요
- 시트 이름은 대소문자를 구분합니다

## 로컬 저장소 백업

Google Sheets API가 비활성화되어 있거나 오류가 발생하면, 점수는 자동으로 브라우저의 로컬 저장소에 저장됩니다. 이 데이터는 개발자 도구(F12)의 Application > Local Storage에서 확인할 수 있습니다.

## 보안 주의사항

⚠️ **중요**: API 키는 민감한 정보입니다!

- API 키를 공개 저장소에 커밋하지 마세요
- 프로덕션 환경에서는 서버 사이드에서 API를 호출하는 것을 권장합니다
- API 키 사용량을 정기적으로 모니터링하세요
- 필요한 경우 API 키 사용을 제한하세요 (HTTP 리퍼러, IP 주소 등)

## 추가 기능 제안

- 리더보드 표시 기능 추가
- 사용자 이름 입력 기능
- 월별/주별 통계 분석
- 데이터 시각화 (차트)
