// ==================== 게임 설정 ====================

// 캔버스 요소 가져오기
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextPieceCanvas.getContext('2d');

// 게임 보드 설정
const ROWS = 20; // 게임 보드 행 수
const COLS = 10; // 게임 보드 열 수
const BLOCK_SIZE = 30; // 각 블록의 크기 (픽셀)

// 게임 상태 변수
let board = []; // 게임 보드 배열
let score = 0; // 현재 점수
let level = 1; // 현재 레벨
let lines = 0; // 제거한 줄 수
let gameRunning = false; // 게임 실행 중 여부
let gamePaused = false; // 게임 일시정지 여부
let gameLoop = null; // 게임 루프 타이머
let dropInterval = 1000; // 블록이 떨어지는 간격 (밀리초)
let lastDropTime = 0; // 마지막으로 블록이 떨어진 시간

// 현재 블록과 다음 블록
let currentPiece = null;
let nextPiece = null;

// ==================== 테트리스 블록 정의 ====================

// 7가지 테트리스 블록 모양 정의 (I, O, T, S, Z, J, L)
const PIECES = {
    'I': {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f0f0' // 하늘색
    },
    'O': {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000' // 노란색
    },
    'T': {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0' // 보라색
    },
    'S': {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000' // 초록색
    },
    'Z': {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000' // 빨간색
    },
    'J': {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0' // 파란색
    },
    'L': {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#f0a000' // 주황색
    }
};

// ==================== 게임 초기화 ====================

// 게임 보드 초기화 함수
function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0; // 0은 빈 칸을 의미
        }
    }
}

// 게임 초기화 함수
function initGame() {
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000; // 초기 속도
    updateScore();
    currentPiece = createPiece();
    nextPiece = createPiece();
    drawNextPiece();
}

// ==================== 블록 생성 및 관리 ====================

// 랜덤 블록 생성 함수
function createPiece() {
    const pieces = Object.keys(PIECES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const pieceData = PIECES[randomPiece];

    return {
        shape: pieceData.shape.map(row => [...row]), // 배열 복사
        color: pieceData.color,
        x: Math.floor(COLS / 2) - Math.floor(pieceData.shape[0].length / 2), // 중앙에 생성
        y: 0
    };
}

// 다음 블록을 현재 블록으로 설정하고 새로운 다음 블록 생성
function spawnNextPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();
    drawNextPiece();

    // 새 블록이 생성될 위치에 이미 블록이 있으면 게임 오버
    // offset은 0으로 설정 (currentPiece의 위치를 그대로 사용)
    if (checkCollision(currentPiece, 0, 0)) {
        gameOver();
    }
}

// ==================== 충돌 감지 ====================

// 블록 충돌 확인 함수
function checkCollision(piece, offsetX, offsetY) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;

                // 벽 충돌 확인
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }

                // 다른 블록과의 충돌 확인
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// ==================== 블록 이동 ====================

// 블록 왼쪽 이동
function moveLeft() {
    if (!gameRunning || gamePaused) return;
    if (!checkCollision(currentPiece, -1, 0)) {
        currentPiece.x--;
        draw();
    }
}

// 블록 오른쪽 이동
function moveRight() {
    if (!gameRunning || gamePaused) return;
    if (!checkCollision(currentPiece, 1, 0)) {
        currentPiece.x++;
        draw();
    }
}

// 블록 아래로 이동
function moveDown() {
    if (!gameRunning || gamePaused) return;
    if (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
        draw();
    } else {
        // 블록이 더 이상 내려갈 수 없으면 보드에 고정
        lockPiece();
    }
}

// 블록 즉시 떨어뜨리기
function hardDrop() {
    if (!gameRunning || gamePaused) return;

    let dropDistance = 0;
    // 블록이 떨어질 수 있는 최대 거리 계산
    while (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
        dropDistance++;
    }

    // 하드 드롭 보너스 점수 (떨어진 거리만큼)
    score += dropDistance * 2;
    updateScore();

    // 화면 업데이트
    draw();

    // 블록 고정
    lockPiece();
}

// ==================== 블록 회전 ====================

// 블록 회전 함수
function rotate() {
    if (!gameRunning || gamePaused) return;

    const rotated = rotateMatrix(currentPiece.shape);
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;

    // 회전 후 충돌 확인
    if (checkCollision(currentPiece, 0, 0)) {
        // 충돌하면 원래대로 되돌림
        currentPiece.shape = previousShape;
    } else {
        draw();
    }
}

// 행렬 회전 함수 (시계방향 90도)
function rotateMatrix(matrix) {
    const N = matrix.length;
    const rotated = [];

    for (let i = 0; i < N; i++) {
        rotated[i] = [];
        for (let j = 0; j < N; j++) {
            rotated[i][j] = matrix[N - 1 - j][i];
        }
    }

    return rotated;
}

// ==================== 블록 고정 및 줄 제거 ====================

// 블록을 보드에 고정
function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }

    // 완성된 줄 제거
    clearLines();

    // 다음 블록 생성
    spawnNextPiece();
    draw();
}

// 완성된 줄 제거 함수
function clearLines() {
    let linesCleared = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
        let isLineFull = true;

        for (let x = 0; x < COLS; x++) {
            if (!board[y][x]) {
                isLineFull = false;
                break;
            }
        }

        if (isLineFull) {
            // 줄 제거
            board.splice(y, 1);
            // 맨 위에 빈 줄 추가
            board.unshift(new Array(COLS).fill(0));
            linesCleared++;
            y++; // 같은 위치 다시 확인
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;

        // 점수 계산 (더 많은 줄을 한번에 제거할수록 높은 점수)
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;

        // 레벨 업 (10줄마다)
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            // 속도 증가 (최소 100ms까지)
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }

        updateScore();
    }
}

// ==================== 화면 그리기 ====================

// 게임 보드 그리기
function draw() {
    // 캔버스 초기화
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 보드의 고정된 블록 그리기
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }

    // 현재 블록 그리기
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }

    // 그리드 그리기
    drawGrid();
}

// 개별 블록 그리기 함수
function drawBlock(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // 블록 테두리
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // 블록 하이라이트 효과
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
}

// 그리드 그리기
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
        ctx.stroke();
    }

    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }
}

// 다음 블록 미리보기 그리기
function drawNextPiece() {
    nextCtx.fillStyle = '#fff';
    nextCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    if (nextPiece) {
        const size = 25; // 미리보기 블록 크기
        const offsetX = (nextPieceCanvas.width - nextPiece.shape[0].length * size) / 2;
        const offsetY = (nextPieceCanvas.height - nextPiece.shape.length * size) / 2;

        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(
                        offsetX + x * size,
                        offsetY + y * size,
                        size,
                        size
                    );
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 2;
                    nextCtx.strokeRect(
                        offsetX + x * size,
                        offsetY + y * size,
                        size,
                        size
                    );
                }
            }
        }
    }
}

// 점수 표시 업데이트
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// ==================== 게임 루프 ====================

// 게임 루프 함수
function gameLoopFunc(currentTime) {
    if (!gameRunning || gamePaused) return;

    // 일정 시간마다 블록 자동 하강
    if (currentTime - lastDropTime > dropInterval) {
        moveDown();
        lastDropTime = currentTime;
    }

    gameLoop = requestAnimationFrame(gameLoopFunc);
}

// ==================== 게임 제어 ====================

// 게임 시작
function startGame() {
    if (gameRunning) return;

    initGame();
    gameRunning = true;
    gamePaused = false;
    lastDropTime = performance.now();

    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('gameOverlay').classList.add('hidden');

    draw();
    gameLoop = requestAnimationFrame(gameLoopFunc);
}

// 게임 일시정지/재개
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    document.getElementById('pauseBtn').textContent = gamePaused ? '재개' : '일시정지';

    if (!gamePaused) {
        lastDropTime = performance.now();
        gameLoop = requestAnimationFrame(gameLoopFunc);
    }
}

// 게임 리셋
function resetGame() {
    gameRunning = false;
    gamePaused = false;

    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '일시정지';
    document.getElementById('gameOverlay').classList.add('hidden');

    initGame();
    draw();
}

// 게임 오버
function gameOver() {
    gameRunning = false;

    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('overlayTitle').textContent = '게임 오버!';
    document.getElementById('overlayMessage').innerHTML = `최종 점수: <span id="finalScore">${score}</span>`;
    document.getElementById('gameOverlay').classList.remove('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;

    // Google Sheets에 점수 저장 (나중에 구현)
    saveScoreToSheet(score, level, lines);
}

// ==================== Google Sheets 연동 ====================

// Google Sheets에 점수 저장
function saveScoreToSheet(score, level, lines) {
    // config.js에 정의된 함수 사용
    if (typeof saveScoreToGoogleSheets === 'function') {
        saveScoreToGoogleSheets(score, level, lines);
    } else {
        // config.js가 로드되지 않은 경우 로컬 저장소에만 저장
        console.log('점수 저장:', {
            날짜: new Date().toLocaleString('ko-KR'),
            점수: score,
            레벨: level,
            라인: lines
        });

        const scores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
        scores.push({
            date: new Date().toISOString(),
            score: score,
            level: level,
            lines: lines
        });
        if (scores.length > 100) {
            scores.splice(0, scores.length - 100);
        }
        localStorage.setItem('tetrisScores', JSON.stringify(scores));
    }
}

// ==================== 이벤트 리스너 ====================

// 키보드 입력 처리
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;

    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            moveRight();
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveDown();
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotate();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
    }
});

// 버튼 이벤트 리스너
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);
document.getElementById('overlayBtn').addEventListener('click', resetGame);

// 모바일 컨트롤 버튼
document.getElementById('leftBtn').addEventListener('click', moveLeft);
document.getElementById('rightBtn').addEventListener('click', moveRight);
document.getElementById('downBtn').addEventListener('click', moveDown);
document.getElementById('rotateBtn').addEventListener('click', rotate);
document.getElementById('dropBtn').addEventListener('click', hardDrop);

// 터치 이벤트 개선 (연속 입력 방지)
const mobileButtons = document.querySelectorAll('.mobile-btn');
mobileButtons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });
});

// ==================== 초기 실행 ====================

// 페이지 로드 시 초기화
initGame();
draw();
