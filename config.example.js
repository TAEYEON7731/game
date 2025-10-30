// ==================== Google Sheets API 설정 ====================

// Google Sheets API 설정
// 사용하려면 Google Cloud Console에서 API 키를 발급받아야 합니다
const GOOGLE_SHEETS_CONFIG = {
    // Google Sheets API 키 (여기에 본인의 API 키를 입력하세요)
    API_KEY: 'YOUR_API_KEY_HERE',

    // Google Sheets 문서 ID (스프레드시트 URL에서 확인 가능)
    // 예: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // 데이터를 저장할 시트 이름
    SHEET_NAME: '테트리스점수',

    // API가 활성화되어 있는지 여부
    ENABLED: false // API 키와 스프레드시트 ID를 설정한 후 true로 변경하세요
};

// ==================== Google Sheets API 함수 ====================

/**
 * Google Sheets에 점수를 저장하는 함수
 * @param {number} score - 점수
 * @param {number} level - 레벨
 * @param {number} lines - 제거한 라인 수
 */
async function saveScoreToGoogleSheets(score, level, lines) {
    // API가 비활성화되어 있으면 로컬 저장소에만 저장
    if (!GOOGLE_SHEETS_CONFIG.ENABLED) {
        console.log('Google Sheets API가 비활성화되어 있습니다.');
        saveToLocalStorage(score, level, lines);
        return;
    }

    try {
        // 현재 시간 가져오기
        const timestamp = new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Google Sheets에 추가할 데이터
        const values = [[timestamp, score, level, lines]];

        // Google Sheets API URL
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEET_NAME}:append?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;

        // API 요청
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (response.ok) {
            console.log('점수가 Google Sheets에 저장되었습니다!');
            // 로컬 저장소에도 백업
            saveToLocalStorage(score, level, lines);
        } else {
            throw new Error('Google Sheets 저장 실패');
        }
    } catch (error) {
        console.error('Google Sheets 저장 중 오류:', error);
        // 오류 발생 시 로컬 저장소에 저장
        saveToLocalStorage(score, level, lines);
    }
}

/**
 * 로컬 저장소에 점수 저장
 * @param {number} score - 점수
 * @param {number} level - 레벨
 * @param {number} lines - 제거한 라인 수
 */
function saveToLocalStorage(score, level, lines) {
    try {
        const scores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
        scores.push({
            date: new Date().toISOString(),
            score: score,
            level: level,
            lines: lines
        });

        // 최근 100개만 저장
        if (scores.length > 100) {
            scores.splice(0, scores.length - 100);
        }

        localStorage.setItem('tetrisScores', JSON.stringify(scores));
        console.log('점수가 로컬 저장소에 저장되었습니다.');
    } catch (error) {
        console.error('로컬 저장소 저장 중 오류:', error);
    }
}

/**
 * 로컬 저장소에서 점수 기록 가져오기
 * @returns {Array} 점수 기록 배열
 */
function getLocalScores() {
    try {
        return JSON.parse(localStorage.getItem('tetrisScores') || '[]');
    } catch (error) {
        console.error('로컬 저장소 읽기 오류:', error);
        return [];
    }
}

/**
 * 최고 점수 가져오기
 * @returns {number} 최고 점수
 */
function getHighScore() {
    const scores = getLocalScores();
    if (scores.length === 0) return 0;
    return Math.max(...scores.map(s => s.score));
}
