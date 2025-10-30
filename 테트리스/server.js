// ==================== 간단한 HTTP 개발 서버 ====================
// Node.js의 기본 모듈만 사용하는 간단한 정적 파일 서버

const http = require('http');
const fs = require('fs');
const path = require('path');

// 서버 설정
let PORT = 3000; // 시작 포트
const HOST = 'localhost';
const MAX_PORT = 3010; // 최대 포트 (3000~3010 범위에서 찾기)

// MIME 타입 매핑
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// HTTP 서버 생성
const server = http.createServer((req, res) => {
    console.log(`요청: ${req.method} ${req.url}`);

    // URL 파싱 (쿼리스트링 제거)
    let filePath = req.url.split('?')[0];

    // 루트 경로면 index.html 반환
    if (filePath === '/') {
        filePath = '/index.html';
    }

    // 파일 전체 경로 생성
    const fullPath = path.join(__dirname, filePath);

    // 파일 확장자 확인
    const extname = String(path.extname(fullPath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 파일 읽기
    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 파일을 찾을 수 없음 (404)
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - 페이지를 찾을 수 없습니다</h1>', 'utf-8');
            } else {
                // 서버 에러 (500)
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h1>500 - 서버 오류</h1><p>${error.code}</p>`, 'utf-8');
            }
        } else {
            // 성공적으로 파일 반환
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache' // 개발 중이므로 캐시 비활성화
            });
            res.end(content, 'utf-8');
        }
    });
});

// 사용 가능한 포트를 찾아서 서버 시작하는 함수
function startServer() {
    server.listen(PORT, HOST, () => {
        console.log('=================================');
        console.log('🎮 테트리스 게임 개발 서버 시작!');
        console.log('=================================');
        console.log(`서버 주소: http://${HOST}:${PORT}`);
        console.log('브라우저에서 위 주소로 접속하세요.');
        console.log('종료하려면 Ctrl+C를 누르세요.');
        console.log('=================================\n');
    });

    // 서버 에러 처리
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            // 포트가 사용 중이면 다음 포트로 재시도
            if (PORT < MAX_PORT) {
                PORT++;
                console.log(`⚠️  포트 ${PORT - 1}이(가) 사용 중입니다. 포트 ${PORT}으로 재시도합니다...`);
                // 서버 재생성 및 재시도
                server.removeAllListeners();
                startServer();
            } else {
                console.error(`❌ 오류: 포트 ${PORT}가 이미 사용 중입니다.`);
                console.error(`사용 가능한 포트가 없습니다 (${3000}~${MAX_PORT} 범위).`);
                console.error('다른 프로그램을 종료하거나 server.js의 MAX_PORT를 수정하세요.');
                process.exit(1);
            }
        } else {
            console.error('❌ 서버 오류:', error);
            process.exit(1);
        }
    });
}

// 서버 시작
startServer();

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
    console.log('\n\n서버를 종료합니다...');
    server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        process.exit(0);
    });
});
