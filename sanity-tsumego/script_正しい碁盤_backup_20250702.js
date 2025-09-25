document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const createModeBtn = document.getElementById('createModeBtn');
    const startScreen = document.getElementById('startScreen');
    const mainDifficultySelect = document.getElementById('mainDifficultySelect');
    const startAllProblemsModeBtn = document.getElementById('startAllProblemsModeBtn');
    const startRankedPracticeModeBtn = document.getElementById('startRankedPracticeModeBtn');
    const startTimeAttackModeBtn = document.getElementById('startTimeAttackModeBtn');

    const allProblemsModeSection = document.getElementById('allProblemsMode');
    const rankedPracticeModeSection = document.getElementById('rankedPracticeMode');
    const createModeSection = document.getElementById('createMode');
    const timeAttackModeSection = document.getElementById('timeAttackMode');

    // Boards
    const goBoard = document.getElementById('goBoard');
    const rankedBoard = document.getElementById('rankedBoard');
    const gameBoard = document.getElementById('gameBoard');
    const createBoard = document.getElementById('createBoard');
    const startScreenBoard = document.getElementById('startScreenBoard');

    // Create Mode Controls
    const initialPlacementModeBtn = document.getElementById('initialPlacementModeBtn');
    const solutionModeBtn = document.getElementById('solutionModeBtn');
    const initialPlacementControls = document.getElementById('initialPlacementControls');
    const solutionControls = document.getElementById('solutionControls');
    const undoLastSolutionMoveBtn = document.getElementById('undoLastSolutionMoveBtn');
    const recordedSolutionMovesSpan = document.getElementById('recordedSolutionMoves');
    const authorNameInput = document.getElementById('authorName');
    const authorRankInput = document.getElementById('authorRank');
    const difficultySelect = document.getElementById('difficulty');
    const finalJudgmentSelect = document.getElementById('finalJudgment');
    const saveProblemBtn = document.getElementById('saveProblemBtn');
    const clearBoardBtn = document.getElementById('clearBoardBtn');

    // Status Messages
    const allProblemsStatus = document.getElementById('allProblemsStatus');
    const rankedPracticeStatus = document.getElementById('rankedPracticeStatus');
    const timeAttackStatus = document.getElementById('timeAttackStatus');

    // --- State Variables ---
    const boardSize = 13;
    let problems = [];
    let createModeState = 'initial'; // 'initial' or 'solution'
    let initialBoardState = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
    let solutionMoves = [];

    // --- Board Rendering (HTML/CSS) ---

    function initializeBoard(boardElement) {
        boardElement.innerHTML = ''; // Clear previous content
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "go-board-svg");
        svg.setAttribute("viewBox", `0 0 ${boardSize * 35} ${boardSize * 35}`); // Adjust viewBox for 13x13
        svg.setAttribute("width", `${boardSize * 35}px`);
        svg.setAttribute("height", `${boardSize * 35}px`);

        // Draw grid lines
        for (let i = 0; i < boardSize; i++) {
            const lineX = document.createElementNS("http://www.w3.org/2000/svg", "line");
            lineX.setAttribute("x1", `${i * 35 + 17.5}`); // Center lines on intersections
            lineX.setAttribute("y1", "17.5");
            lineX.setAttribute("x2", `${i * 35 + 17.5}`);
            lineX.setAttribute("y2", `${(boardSize - 1) * 35 + 17.5}`);
            lineX.setAttribute("stroke", "black");
            lineX.setAttribute("stroke-width", "1");
            svg.appendChild(lineX);

            const lineY = document.createElementNS("http://www.w3.org/2000/svg", "line");
            lineY.setAttribute("x1", "17.5");
            lineY.setAttribute("y1", `${i * 35 + 17.5}`);
            lineY.setAttribute("x2", `${(boardSize - 1) * 35 + 17.5}`);
            lineY.setAttribute("y2", `${i * 35 + 17.5}`);
            lineY.setAttribute("stroke", "black");
            lineY.setAttribute("stroke-width", "1");
            svg.appendChild(lineY);
        }

        // Draw star points (for 13x13 board)
        const starPoints = [
            [3, 3], [3, 9], [9, 3], [9, 9], // Corners
            [3, 6], [6, 3], [6, 9], [9, 6], // Sides
            [6, 6] // Center
        ];
        starPoints.forEach(point => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", `${point[1] * 35 + 17.5}`);
            circle.setAttribute("cy", `${point[0] * 35 + 17.5}`);
            circle.setAttribute("r", "3"); // Radius of star point
            circle.setAttribute("fill", "black");
            svg.appendChild(circle);
        });

        boardElement.appendChild(svg);

        // Create transparent squares for interaction
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = row;
                square.dataset.col = col;
                square.style.position = 'absolute';
                square.style.width = '35px';
                square.style.height = '35px';
                square.style.top = `${row * 35}px`;
                square.style.left = `${col * 35}px`;
                boardElement.appendChild(square);
            }
        }
    }

    function drawStones(boardElement, boardState, moves = []) {
        // Remove all existing stones
        boardElement.querySelectorAll('.stone').forEach(stone => stone.remove());

        // Draw initial stones
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (boardState[row][col] !== 0) {
                    placeStone(boardElement, row, col, boardState[row][col] === 1 ? 'black' : 'white');
                }
            }
        }
        // Draw solution moves
        moves.forEach((move, index) => {
            placeStone(boardElement, move.row, move.col, move.player === 1 ? 'black' : 'white', index + 1);
        });
    }

    function placeStone(boardElement, row, col, color, number = null) {
        const svg = boardElement.querySelector('.go-board-svg');
        if (!svg) return;

        const stone = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        stone.setAttribute("cx", `${col * 35 + 17.5}`);
        stone.setAttribute("cy", `${row * 35 + 17.5}`);
        stone.setAttribute("r", "16"); // Radius of stone
        stone.setAttribute("class", `stone ${color}`);
        if (number) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", `${col * 35 + 17.5}`);
            text.setAttribute("y", `${row * 35 + 17.5 + 5}`); // Adjust for vertical alignment
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", color === 'black' ? 'white' : 'black');
            text.setAttribute("font-size", "14");
            text.textContent = number;
            svg.appendChild(stone);
            svg.appendChild(text);
        } else {
            svg.appendChild(stone);
        }
    }

    // --- Mode Switching ---
    function hideAllModes() {
        [startScreen, allProblemsModeSection, rankedPracticeModeSection, createModeSection, timeAttackModeSection].forEach(el => el.classList.add('hidden'));
    }

    function showCreateMode() {
        hideAllModes();
        createModeSection.classList.remove('hidden');
        initializeBoard(createBoard);
        resetCreateMode();
    }

    // --- Problem Creation Mode --- //

    function resetCreateMode() {
        setCreateMode('initial');
        initialBoardState = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
        solutionMoves = [];
        drawStones(createBoard, initialBoardState, solutionMoves);
        updateRecordedSolutionMoves();
    }

    function setCreateMode(mode) {
        createModeState = mode;
        initialPlacementModeBtn.classList.toggle('active', mode === 'initial');
        solutionModeBtn.classList.toggle('active', mode === 'solution');
        initialPlacementControls.classList.toggle('hidden', mode !== 'initial');
        solutionControls.classList.toggle('hidden', mode !== 'solution');
    }

    initialPlacementModeBtn.addEventListener('click', () => setCreateMode('initial'));
    solutionModeBtn.addEventListener('click', () => setCreateMode('solution'));

    createBoard.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const target = event.target.closest('.square'); // Ensure we get the intersection div
        if (!target) return;

        const row = parseInt(target.dataset.row, 10);
        const col = parseInt(target.dataset.col, 10);

        if (createModeState === 'initial') {
            const stoneColor = event.button === 0 ? 1 : 2; // Left: Black (1), Right: White (2)
            if (initialBoardState[row][col] === stoneColor) {
                initialBoardState[row][col] = 0; // Remove stone
            } else {
                initialBoardState[row][col] = stoneColor; // Place stone
            }
        } else { // Solution mode
            // Prevent placing on initial stones
            if (initialBoardState[row][col] !== 0) return;
            // Prevent placing on existing solution moves
            if (solutionMoves.some(m => m.row === row && m.col === col)) return;

            const player = (solutionMoves.length % 2 === 0) ? 1 : 2; // Black starts
            solutionMoves.push({ row: row, col: col, player });
        }
        drawStones(createBoard, initialBoardState, solutionMoves);
        updateRecordedSolutionMoves();
    });

    createBoard.addEventListener('contextmenu', e => e.preventDefault());

    undoLastSolutionMoveBtn.addEventListener('click', () => {
        if (solutionMoves.length > 0) {
            solutionMoves.pop();
            drawStones(createBoard, initialBoardState, solutionMoves);
            updateRecordedSolutionMoves();
        }
    });

    clearBoardBtn.addEventListener('click', resetCreateMode);

    function updateRecordedSolutionMoves() {
        recordedSolutionMovesSpan.textContent = solutionMoves.map(move => `(${move.col + 1}, ${move.row + 1})`).join(', ');
    }

    saveProblemBtn.addEventListener('click', () => {
        // Save logic will be re-implemented later
        alert('問題の保存機能は現在開発中です。');
    });

    // --- Initial Setup ---
    createModeBtn.addEventListener('click', showCreateMode);
    // Dummy event listeners for other modes for now
    startAllProblemsModeBtn.addEventListener('click', () => alert('全問題練習モードは開発中です。'));
    startRankedPracticeModeBtn.addEventListener('click', () => alert('段級別練習モードは開発中です。'));
    startTimeAttackModeBtn.addEventListener('click', () => alert('タイムアタックモードは開発中です。'));

    // Initialize all boards
    [goBoard, rankedBoard, gameBoard, createBoard, startScreenBoard].forEach(board => {
        if(board) initializeBoard(board);
    });

    // Show start screen initially
    hideAllModes();
    startScreen.classList.remove('hidden');
});