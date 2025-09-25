document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const createModeBtn = document.getElementById('createModeBtn');
    const startScreen = document.getElementById('startScreen');
    const mainDifficultySelect = document.getElementById('mainDifficultySelect');
    const startNormalModeBtn = document.getElementById('startNormalModeBtn');
    const startTimeAttackModeBtn = document.getElementById('startTimeAttackModeBtn');

    // Disable buttons initially
    startNormalModeBtn.disabled = true;
    startTimeAttackModeBtn.disabled = true;

    const normalModeSection = document.getElementById('normalMode');
    const createModeSection = document.getElementById('createMode');
    const timeAttackModeSection = document.getElementById('timeAttackMode');

    // Boards
    const goBoard = document.getElementById('goBoard');
    const gameBoard = document.getElementById('gameBoard');
    const createBoard = document.getElementById('createBoard');
    const startScreenBoard = document.getElementById('startScreenBoard');

    // Create Mode Controls
    const initialPlacementModeBtn = document.getElementById('initialPlacementModeBtn');
    const solutionModeBtn = document.getElementById('solutionModeBtn');
    const initialPlacementControls = document.getElementById('initialPlacementControls');
    const solutionControls = document.getElementById('solutionControls');
    const undoLastSolutionMoveBtn = document.getElementById('undoLastSolutionMoveBtn');
    const goUpTreeBtn = document.getElementById('goUpTreeBtn');
    const markCorrectBtn = document.getElementById('markCorrectBtn');
    const markFailureBtn = document.getElementById('markFailureBtn');
    const solutionTreeContainer = document.getElementById('solutionTreeContainer');
    const authorNameInput = document.getElementById('authorName');
    const authorRankInput = document.getElementById('authorRank');
    const difficultySelect = document.getElementById('difficulty');
    const finalJudgmentSelect = document.getElementById('finalJudgment');
    const saveProblemBtn = document.getElementById('saveProblemBtn');
    const clearBoardBtn = document.getElementById('clearBoardBtn');

    // Status Messages
    const normalModeStatus = document.getElementById('normalModeStatus');
    const timeAttackStatus = document.getElementById('timeAttackStatus');
    const problemListContainer = document.getElementById('problemListContainer');

    // Time Attack Mode Elements
    const timeRemainingSpan = document.getElementById('timeRemaining');
    const currentProblemCountSpan = document.getElementById('currentProblemCount');
    const totalProblemCountSpan = document.getElementById('totalProblemCount');
    const correctAnswersSpan = document.getElementById('correctAnswers');
    const startGameBtn = document.getElementById('startGameBtn');
    const resetGameBtn = document.getElementById('resetGameBtn');

    // Event listener for difficulty select
    mainDifficultySelect.addEventListener('change', () => {
        console.log('Difficulty selected:', mainDifficultySelect.value);
        if (mainDifficultySelect.value !== 'all') { // Assuming 'all' is the default/unselected value
            startNormalModeBtn.disabled = false;
            startTimeAttackModeBtn.disabled = false;
            console.log('Buttons enabled.');
        } else {
            startNormalModeBtn.disabled = true;
            startTimeAttackModeBtn.disabled = true;
            console.log('Buttons disabled.');
        }
    });

    // --- State Variables ---
    const boardSize = 13;
    let problems = loadProblems(); // Load problems from localStorage
    let createModeState = 'initial'; // 'initial' or 'solution'
    let initialBoardState = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
    let solutionMoves = [];

    // Time Attack State
    let timeAttackProblems = [];
    let currentProblemIndex = 0;
    let correctAnswersCount = 0;
    let timeRemaining = 0;
    let timerInterval = null;
    let gameActive = false;
    let userMoves = [];
    let currentProblemNode = null; // Tracks current node in solutionTree during gameplay
    let currentPlayableBoardState = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0)); // Add this line

    // Normal Mode Play State
    let normalModeCurrentProblem = null;
    let normalModeCurrentPlayer = 1; // 1 for black, 2 for white

    // --- Local Storage Functions ---
    function loadProblems() {
        const problemsJson = localStorage.getItem('goProblems');
        return problemsJson ? JSON.parse(problemsJson) : [];
    }

    function saveProblems(problemsToSave) {
        localStorage.setItem('goProblems', JSON.stringify(problemsToSave));
    }

    // --- Board Rendering (HTML/CSS) ---

    function initializeBoard(boardElement, isMiniBoard = false) {
        boardElement.innerHTML = ''; // Clear previous content
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "go-board-svg");
        svg.setAttribute("viewBox", `0 0 ${boardSize * 35} ${boardSize * 35}`); // Always use full board size for viewBox
        svg.setAttribute("width", `${boardSize * 35}px`); // Always use full board size for width
        svg.setAttribute("height", `${boardSize * 35}px`); // Always use full board size for height

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

        // Create transparent squares for interaction only if not a mini board
        if (!isMiniBoard) {
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
    }

    function drawStones(boardElement, boardState, moves = []) {
        const svg = boardElement.querySelector('.go-board-svg');
        if (!svg) return;

        // Remove all existing stones and text elements (move numbers)
        svg.querySelectorAll('.stone, text').forEach(el => el.remove());

        // Draw stones based on the current boardState
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (boardState[row][col] !== 0) {
                    // Check if this stone is part of the 'moves' array and get its number
                    const moveIndex = moves.findIndex(move => move.row === row && move.col === col);
                    const moveNumber = moveIndex !== -1 ? moveIndex + 1 : null;
                    placeStone(boardElement, row, col, boardState[row][col] === 1 ? 'black' : 'white', moveNumber);
                }
            }
        }
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

    // Helper function to get connected group and its liberties
    function getGroupAndLiberties(board, r, c, player) {
        const group = [];
        let liberties = 0;
        const queue = [[r, c]];
        const visited = Array(boardSize).fill(0).map(() => Array(boardSize).fill(false)); // Initialize visited here
        visited[r][c] = true;

        while (queue.length > 0) {
            const [currR, currC] = queue.shift();
            group.push([currR, currC]);

            const neighbors = [
                [currR - 1, currC], [currR + 1, currC],
                [currR, currC - 1], [currR, currC + 1]
            ];

            for (const [nR, nC] of neighbors) {
                if (nR >= 0 && nR < boardSize && nC >= 0 && nC < boardSize) {
                    if (board[nR][nC] === 0 && !visited[nR][nC]) {
                        liberties++;
                        visited[nR][nC] = true; // Mark empty spaces as visited to count each liberty once
                    } else if (board[nR][nC] === player && !visited[nR][nC]) {
                        visited[nR][nC] = true;
                        queue.push([nR, nC]);
                    }
                }
            }
        }
        return { group, liberties };
    }

    // Function to remove captured stones for a specific player
    function removeCapturedStones(currentBoardState, playerToCheck) {
        const newBoardState = JSON.parse(JSON.stringify(currentBoardState)); // Deep copy

        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (newBoardState[r][c] === playerToCheck) {
                    const { group, liberties } = getGroupAndLiberties(newBoardState, r, c, playerToCheck);
                    if (liberties === 0) {
                        // Captured group, remove stones
                        group.forEach(([stoneR, stoneC]) => {
                            newBoardState[stoneR][stoneC] = 0;
                        });
                    }
                }
            }
        }
        return newBoardState;
    }

    // New function to apply a move and handle captures
    function applyMove(boardState, row, col, player) {
        if (boardState[row][col] !== 0) {
            // Intersection is already occupied
            return null; // Or throw an error, or return original state
        }

        let tempBoard = JSON.parse(JSON.stringify(boardState)); // Deep copy
        tempBoard[row][col] = player;

        const opponent = player === 1 ? 2 : 1;

        // 1. Check for captures of opponent's stones
        let boardAfterOpponentCapture = removeCapturedStones(tempBoard, opponent);

        // 2. Check for self-capture (if no opponent stones were captured)
        // This is a simplified self-capture rule. In real Go, self-capture is illegal unless it captures opponent stones.
        // Here, we just remove any group with 0 liberties.
        let finalBoardState = removeCapturedStones(boardAfterOpponentCapture, player);

        // Check for Ko rule (simplified: prevent immediate recapture of a single stone)
        // This is a very basic Ko check and might need more sophisticated logic for a full Go game.
        // For now, we'll just prevent placing a stone that immediately reverts the board to the exact previous state.
        // This requires storing previous board states, which is not currently implemented.
        // For this problem, we'll skip a full Ko implementation.

        return finalBoardState;
    }

    // --- Mode Switching ---
    function hideAllModes() {
        [startScreen, normalModeSection, createModeSection, timeAttackModeSection].forEach(el => el.classList.add('hidden'));
    }

    function showCreateMode() {
        hideAllModes();
        createModeSection.classList.remove('hidden');
        initializeBoard(createBoard);
        resetCreateMode();
    }

    function showTimeAttackMode() {
        hideAllModes();
        timeAttackModeSection.classList.remove('hidden');
        initializeBoard(gameBoard); // Initialize gameBoard for time attack
        startGameBtn.disabled = false; // Enable the start game button when showing time attack mode
    }

    function showNormalMode(difficulty = 'all') { // Add difficulty parameter
        hideAllModes();
        normalModeSection.classList.remove('hidden');
        initializeBoard(goBoard);
        renderProblemList(difficulty); // Pass difficulty to renderProblemList
    }

    function renderProblemList(filterDifficulty = 'all') { // Add filterDifficulty parameter
        problemListContainer.innerHTML = '';
        const filteredProblems = problems.filter(problem => {
            return filterDifficulty === 'all' || problem.difficulty === filterDifficulty;
        });

        if (filteredProblems.length === 0) {
            problemListContainer.textContent = '登録された問題がありません。';
            return;
        }

        const ul = document.createElement('ul');
        filteredProblems.forEach(problem => { // Use filteredProblems
            const li = document.createElement('li');
            li.classList.add('problem-list-item'); // Add a class for styling
            li.dataset.problemId = problem.id; // Add data-problem-id to the li

            const problemInfo = document.createElement('div');
            problemInfo.classList.add('problem-info');
            problemInfo.innerHTML = `
                <span>ID: ${problem.id}</span>
                <span>難易度: ${problem.difficulty}</span>
                <span>作者: ${problem.authorName || 'なし'}</span>
            `;
            li.appendChild(problemInfo);

            const miniBoardContainer = document.createElement('div');
            miniBoardContainer.classList.add('mini-go-board-container');
            const miniBoard = document.createElement('div');
            miniBoard.classList.add('mini-go-board');
            miniBoardContainer.appendChild(miniBoard);
            li.appendChild(miniBoardContainer);

            ul.appendChild(li);

            // Initialize and draw the mini board
            initializeBoard(miniBoard, true); // Pass true for isMiniBoard
            drawStones(miniBoard, problem.initialBoard);

            // Add click listener to the entire li
            li.addEventListener('click', () => {
                playProblemInNormalMode(problem.id); // Changed from editProblem
            });
        });
        problemListContainer.appendChild(ul);
    }

    function editProblem(problemId) {
        const problemToEdit = problems.find(p => p.id === problemId);
        if (!problemToEdit) return;

        showCreateMode();

        authorNameInput.value = problemToEdit.authorName || '';
        authorRankInput.value = problemToEdit.authorRank || '';
        difficultySelect.value = problemToEdit.difficulty || '15k';
        finalJudgmentSelect.value = problemToEdit.finalJudgment || '';

        initialBoardState = JSON.parse(JSON.stringify(problemToEdit.initialBoard));
        solutionTree = JSON.parse(JSON.stringify(problemToEdit.solutionTree || { id: 'root', children: [] }));
        selectedNodeId = 'root';
        nextNodeId = 0; // Reset, or ideally calculate max id from tree

        drawForCreateMode();

        saveProblemBtn.textContent = '問題を更新';
        saveProblemBtn.dataset.editingProblemId = problemId;
    }

    // New function to play a problem in normal mode
    function playProblemInNormalMode(problemId) {
        const problemToPlay = problems.find(p => p.id === problemId);
        if (!problemToPlay) return;

        hideAllModes();
        normalModeSection.classList.remove('hidden');
        initializeBoard(goBoard); // Initialize the main board

        // Set up the state for solving
        normalModeCurrentProblem = problemToPlay;
        initialBoardState = JSON.parse(JSON.stringify(problemToPlay.initialBoard)); // Store the initial state
        currentPlayableBoardState = JSON.parse(JSON.stringify(problemToPlay.initialBoard));
        solutionTree = problemToPlay.solutionTree;
        currentProblemNode = solutionTree; // Start at the root of the solution tree
        userMoves = []; // Reset user moves

        drawStones(goBoard, currentPlayableBoardState);
        // Find the first player from the solution tree, default to Black (1)
        const firstPlayer = solutionTree.children.length > 0 ? solutionTree.children[0].player : 1;
        normalModeStatus.textContent = `${firstPlayer === 1 ? '黒' : '白'}番です。正解の手順で石を置いてください。`;
    }

    // --- Time Attack Mode ---

    function displayProblem() {
        if (currentProblemIndex >= timeAttackProblems.length) {
            endGame();
            return;
        }
        const problem = timeAttackProblems[currentProblemIndex];
        initialBoardState = JSON.parse(JSON.stringify(problem.initialBoard)); // Keep initialBoardState as the original problem setup
        currentPlayableBoardState = JSON.parse(JSON.stringify(problem.initialBoard)); // Initialize currentPlayableBoardState
        solutionTree = problem.solutionTree; // Load the full solution tree
        currentProblemNode = solutionTree; // Start at the root of the solution tree
        userMoves = [];

        drawStones(gameBoard, currentPlayableBoardState); // Draw based on currentPlayableBoardState
        currentProblemCountSpan.textContent = currentProblemIndex + 1;
        correctAnswersSpan.textContent = correctAnswersCount;
        timeAttackStatus.textContent = '';
    }

    function startAttackMode(difficulty = 'all') { // Add difficulty parameter
        console.log("startAttackMode called");
        console.log("problems:", problems);
        const filteredProblems = problems.filter(problem => {
            return difficulty === 'all' || problem.difficulty === difficulty;
        });

        if (filteredProblems.length === 0) {
            alert('選択された棋力の問題がありません。問題登録モードで問題を作成してください。');
            return;
        }
        showTimeAttackMode();
        timeAttackProblems = [...filteredProblems].sort(() => Math.random() - 0.5); // Shuffle filtered problems
        currentProblemIndex = 0;
        correctAnswersCount = 0;
        timeRemaining = 30; // 30 seconds for time attack
        gameActive = true;
        userMoves = [];
        // currentProblemNode = null; // Removed: This is initialized in displayProblem

        // Disable start buttons // Removed
        // startTimeAttackModeBtn.disabled = true; // Removed
        // startGameBtn.disabled = true; // Removed

        totalProblemCountSpan.textContent = timeAttackProblems.length;
        updateTimeDisplay();
        displayProblem();
        startTimer();
    }

    function updateTimeDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeRemainingSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimeDisplay();
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        gameActive = false;
        timeAttackStatus.textContent = `ゲーム終了！正解数: ${correctAnswersCount} / ${currentProblemIndex}問`;
        // Optionally show a restart button or go back to main menu
    }

    function resetGame() {
        clearInterval(timerInterval);
        gameActive = false;
        timeAttackStatus.textContent = '';
        timeRemaining = 0;
        currentProblemIndex = 0;
        correctAnswersCount = 0;
        userMoves = [];
        updateTimeDisplay();
        currentProblemCountSpan.textContent = '0';
        correctAnswersSpan.textContent = '0';
        hideAllModes();
        startScreen.classList.remove('hidden');
    }

    // Event listener for normal mode board (goBoard)
    goBoard.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const target = event.target.closest('.square');
        if (!target || !normalModeCurrentProblem) return; // Don't do anything if no problem is loaded

        const row = parseInt(target.dataset.row, 10);
        const col = parseInt(target.dataset.col, 10);

        const nextExpectedMoveNode = currentProblemNode.children.find(node => node.row === row && node.col === col);

        if (nextExpectedMoveNode) {
            const newBoardState = applyMove(currentPlayableBoardState, nextExpectedMoveNode.row, nextExpectedMoveNode.col, nextExpectedMoveNode.player);
            if (!newBoardState) {
                normalModeStatus.textContent = '不正解... (無効な手)';
                setTimeout(() => {
                    userMoves = [];
                    currentProblemNode = solutionTree;
                    currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState));
                    drawStones(goBoard, currentPlayableBoardState);
                    normalModeStatus.textContent = '最初からやり直してください。';
                }, 1500);
                return;
            }

            userMoves.push({ row: nextExpectedMoveNode.row, col: nextExpectedMoveNode.col, player: nextExpectedMoveNode.player });
            currentProblemNode = nextExpectedMoveNode;
            currentPlayableBoardState = newBoardState;
            drawStones(goBoard, currentPlayableBoardState, userMoves);

            if (currentProblemNode.judgement) {
                if (currentProblemNode.judgement === 'correct') {
                    normalModeStatus.textContent = '正解！';
                } else if (currentProblemNode.judgement === 'incorrect') {
                    normalModeStatus.textContent = '失敗...';
                }
                // Don't automatically advance, let the user go back to the list
                return;
            }

            const whiteResponseNode = currentProblemNode.children.find(node => node.player === 2);
            if (whiteResponseNode) {
                const whiteNewBoardState = applyMove(currentPlayableBoardState, whiteResponseNode.row, whiteResponseNode.col, whiteResponseNode.player);
                if (!whiteNewBoardState) {
                    console.error("White's response is an invalid move.");
                    normalModeStatus.textContent = 'エラー: 白の応手が無効です。';
                    return;
                }
                setTimeout(() => {
                    userMoves.push({ row: whiteResponseNode.row, col: whiteResponseNode.col, player: whiteResponseNode.player });
                    currentProblemNode = whiteResponseNode;
                    currentPlayableBoardState = whiteNewBoardState;
                    drawStones(goBoard, currentPlayableBoardState, userMoves);

                    if (currentProblemNode.judgement) {
                        if (currentProblemNode.judgement === 'correct') {
                            normalModeStatus.textContent = '正解！';
                        } else if (currentProblemNode.judgement === 'incorrect') {
                            normalModeStatus.textContent = '失敗...';
                        }
                    }
                }, 500);
            } else if (currentProblemNode.children.length === 0 && !currentProblemNode.judgement) {
                normalModeStatus.textContent = '手順が途中で終わっています。';
            }

        } else {
            normalModeStatus.textContent = '不正解...';
            setTimeout(() => {
                userMoves = [];
                currentProblemNode = solutionTree;
                currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState));
                drawStones(goBoard, currentPlayableBoardState);
                normalModeStatus.textContent = '最初からやり直してください。';
            }, 1500);
        }
    });


    gameBoard.addEventListener('mousedown', (event) => {
        if (!gameActive) return;
        event.preventDefault();
        const target = event.target.closest('.square');
        if (!target) return;

        const row = parseInt(target.dataset.row, 10);
        const col = parseInt(target.dataset.col, 10);

        // Find the next expected move in the current branch of the solution tree
        const nextExpectedMoveNode = currentProblemNode.children.find(node => node.row === row && node.col === col);

        if (nextExpectedMoveNode) {
            // Simulate the move to get the new board state after capture
            const newBoardState = applyMove(currentPlayableBoardState, nextExpectedMoveNode.row, nextExpectedMoveNode.col, nextExpectedMoveNode.player);
            if (!newBoardState) {
                // Invalid move (e.g., occupied, self-capture without capture)
                timeAttackStatus.textContent = '不正解... (無効な手)';
                setTimeout(() => {
                    userMoves = [];
                    currentProblemNode = solutionTree;
                    currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState)); // Reset playable board state
                    drawStones(gameBoard, currentPlayableBoardState);
                    timeAttackStatus.textContent = '';
                }, 1500);
                return;
            }

            // Correct move
            userMoves.push({ row: nextExpectedMoveNode.row, col: nextExpectedMoveNode.col, player: nextExpectedMoveNode.player });
            currentProblemNode = nextExpectedMoveNode; // Move deeper into the tree
            currentPlayableBoardState = newBoardState; // Update the currentPlayableBoardState for subsequent moves
            drawStones(gameBoard, currentPlayableBoardState, userMoves);

            // Check if this is a terminal node with a judgement
            if (currentProblemNode.judgement) {
                if (currentProblemNode.judgement === 'correct') {
                    timeAttackStatus.textContent = '正解！';
                    correctAnswersCount++;
                    currentProblemIndex++; // Only advance on correct
                    setTimeout(() => displayProblem(), 1500); // Only advance on correct
                } else if (currentProblemNode.judgement === 'incorrect') {
                    timeAttackStatus.textContent = '失敗...';
                    // Reset the current problem instead of advancing
                    setTimeout(() => {
                        userMoves = []; // Reset moves for this problem
                        currentProblemNode = solutionTree; // Reset to root of the tree for this problem
                        currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState)); // Reset playable board state
                        drawStones(gameBoard, currentPlayableBoardState);
                        timeAttackStatus.textContent = '';
                    }, 1500);
                }
                return; // Return after handling judgment
            }

            // If not a terminal node, check for an automatic White response
            const whiteResponseNode = currentProblemNode.children.find(node => node.player === 2);
            if (whiteResponseNode) {
                const whiteNewBoardState = applyMove(currentPlayableBoardState, whiteResponseNode.row, whiteResponseNode.col, whiteResponseNode.player); // Use currentPlayableBoardState
                if (!whiteNewBoardState) {
                    // This should ideally not happen if the solution is valid
                    console.error("White's response is an invalid move.");
                    timeAttackStatus.textContent = 'エラー: 白の応手が無効です。';
                    setTimeout(() => {
                        userMoves = [];
                        currentProblemNode = solutionTree;
                        currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState)); // Reset playable board state
                        drawStones(gameBoard, currentPlayableBoardState);
                        timeAttackStatus.textContent = '';
                    }, 1500);
                    return;
                }

                setTimeout(() => {
                    userMoves.push({ row: whiteResponseNode.row, col: whiteResponseNode.col, player: whiteResponseNode.player });
                    currentProblemNode = whiteResponseNode;
                    currentPlayableBoardState = whiteNewBoardState; // Update board state after White's move
                    drawStones(gameBoard, currentPlayableBoardState, userMoves);

                    // Check if White's move is a terminal node with a judgement
                    if (currentProblemNode.judgement) {
                        if (currentProblemNode.judgement === 'correct') {
                            timeAttackStatus.textContent = '正解！';
                            correctAnswersCount++;
                        } else if (currentProblemNode.judgement === 'incorrect') {
                            timeAttackStatus.textContent = '失敗...';
                        }
                        currentProblemIndex++;
                        setTimeout(() => displayProblem(), 1500);
                    }
                }, 500); // 0.5 second delay for White's move
            } else if (currentProblemNode.children.length === 0) {
                // If no white response and no children, it's an incomplete solution path
                timeAttackStatus.textContent = '手順が途中で終わっています。';
                setTimeout(() => {
                    userMoves = [];
                    currentProblemNode = solutionTree;
                    currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState)); // Reset playable board state
                    drawStones(gameBoard, currentPlayableBoardState);
                    timeAttackStatus.textContent = '';
                }, 1500);
            }

        } else {
            // Incorrect move
            timeAttackStatus.textContent = '不正解...';
            setTimeout(() => {
                userMoves = []; // Reset moves for this problem
                currentProblemNode = solutionTree; // Reset to root of the tree for this problem
                currentPlayableBoardState = JSON.parse(JSON.stringify(initialBoardState)); // Reset playable board state
                drawStones(gameBoard, currentPlayableBoardState);
                timeAttackStatus.textContent = '';
            }, 1500);
        }
    });

    // --- Problem Creation Mode --- //

    let solutionTree = {};
    let selectedNodeId = null;
    let nextNodeId = 0;

    function resetCreateMode() {
        setCreateMode('initial');
        initialBoardState = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
        solutionTree = { id: 'root', children: [] };
        selectedNodeId = 'root';
        nextNodeId = 0;
        drawForCreateMode();
    }

    function setCreateMode(mode) {
        createModeState = mode;
        initialPlacementModeBtn.classList.toggle('active', mode === 'initial');
        solutionModeBtn.classList.toggle('active', mode === 'solution');
        initialPlacementControls.classList.toggle('hidden', mode !== 'initial');
        solutionControls.classList.toggle('hidden', mode !== 'solution');
        // Hide judgement controls if not in solution mode or no node selected
        const judgementControls = document.querySelector('.judgement-controls');
        if (judgementControls) {
            judgementControls.classList.toggle('hidden', mode !== 'solution' || selectedNodeId === 'root');
        }
    }

    function drawForCreateMode() {
        const moves = getMovesFromTree(selectedNodeId);
        let simulatedBoardState = JSON.parse(JSON.stringify(initialBoardState));
        moves.forEach(move => {
            simulatedBoardState = applyMove(simulatedBoardState, move.row, move.col, move.player);
        });
        drawStones(createBoard, simulatedBoardState, moves);
        renderSolutionTree();
        // Update visibility of judgement controls
        const judgementControls = document.querySelector('.judgement-controls');
        if (judgementControls) {
            judgementControls.classList.toggle('hidden', createModeState !== 'solution' || selectedNodeId === 'root');
        }
    }

    function renderSolutionTree() {
        const container = document.getElementById('solutionTreeContainer');
        container.innerHTML = '';
        const ul = document.createElement('ul');
        buildTree(ul, solutionTree.children);
        container.appendChild(ul);

        function buildTree(parentUl, nodes) {
            nodes.forEach(node => {
                const li = document.createElement('li');
                const span = document.createElement('span');
                span.textContent = `(${node.col + 1}, ${node.row + 1})`;
                span.className = `move-node ${node.player === 1 ? 'black' : 'white'}`;
                if (node.judgement) {
                    span.classList.add(node.judgement);
                }
                span.dataset.nodeId = node.id;
                if (node.id === selectedNodeId) {
                    span.classList.add('selected');
                }
                span.addEventListener('click', () => {
                    selectedNodeId = node.id;
                    drawForCreateMode();
                });
                li.appendChild(span);

                if (node.children && node.children.length > 0) {
                    const nestedUl = document.createElement('ul');
                    buildTree(nestedUl, node.children);
                    li.appendChild(nestedUl);
                }
                parentUl.appendChild(li);
            });
        }
    }

    function addMoveToTree(row, col) {
        const parentNode = findNodeById(solutionTree, selectedNodeId);
        if (!parentNode) return;

        // Clear parent's judgement if a new move is added
        if (parentNode.judgement) {
            delete parentNode.judgement;
        }

        const player = (getDepth(selectedNodeId) % 2 === 0) ? 1 : 2;
        const newNode = {
            id: `node-${nextNodeId++}`,
            row,
            col,
            player,
            children: []
        };

        parentNode.children.push(newNode);
        selectedNodeId = newNode.id;
        drawForCreateMode();
    }

    function findNodeById(node, id) {
        if (node.id === id) return node;
        for (const child of node.children) {
            const found = findNodeById(child, id);
            if (found) return found;
        }
        return null;
    }

    function getMovesFromTree(nodeId) {
        let moves = [];
        let currentNode = findNodeById(solutionTree, nodeId);
        while (currentNode && currentNode.id !== 'root') {
            moves.unshift({ row: currentNode.row, col: currentNode.col, player: currentNode.player });
            currentNode = findParentNode(solutionTree, currentNode.id);
        }
        return moves;
    }

    function findParentNode(node, id) {
        for (const child of node.children) {
            if (child.id === id) return node;
            const found = findParentNode(child, id);
            if (found) return found;
        }
        return null;
    }

    function getDepth(nodeId) {
        let depth = 0;
        let currentNode = findNodeById(solutionTree, nodeId);
        while (currentNode && currentNode.id !== 'root') {
            depth++;
            currentNode = findParentNode(solutionTree, currentNode.id);
        }
        return depth;
    }

    initialPlacementModeBtn.addEventListener('click', () => setCreateMode('initial'));
    solutionModeBtn.addEventListener('click', () => setCreateMode('solution'));

    createBoard.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const target = event.target.closest('.square');
        if (!target) return;

        const row = parseInt(target.dataset.row, 10);
        const col = parseInt(target.dataset.col, 10);

        if (createModeState === 'initial') {
            const player = event.button === 0 ? 1 : 2; // Left: Black (1), Right: White (2)
            if (initialBoardState[row][col] === player) {
                initialBoardState[row][col] = 0; // Remove stone if same color
            } else {
                const newBoard = applyMove(initialBoardState, row, col, player);
                if (newBoard) {
                    initialBoardState = newBoard;
                } else {
                    // Handle invalid move (e.g., already occupied)
                    console.log("Invalid move in initial placement mode.");
                }
            }
            drawForCreateMode();
        } else { // Solution mode
            addMoveToTree(row, col);
        }
    });

    createBoard.addEventListener('contextmenu', e => e.preventDefault());

    createBoard.addEventListener('wheel', (event) => {
        if (createModeState !== 'solution') return;
        event.preventDefault();

        if (event.deltaY < 0) { // Scroll Up - Go to parent
            const parent = findParentNode(solutionTree, selectedNodeId);
            if (parent) {
                selectedNodeId = parent.id;
                drawForCreateMode();
            }
        } else { // Scroll Down - Go to first child
            const currentNode = findNodeById(solutionTree, selectedNodeId);
            if (currentNode && currentNode.children.length > 0) {
                // Find the index of the current node in its parent's children array
                const parent = findParentNode(solutionTree, selectedNodeId);
                if (parent) {
                    const currentIndex = parent.children.findIndex(child => child.id === selectedNodeId);
                    // This logic is not quite right for navigating siblings.
                    // Let's stick to a simpler "go to first child" model for now.
                }
                selectedNodeId = currentNode.children[0].id;
                drawForCreateMode();
            }
        }
    });

    undoLastSolutionMoveBtn.addEventListener('click', () => {
        const parent = findParentNode(solutionTree, selectedNodeId);
        if (parent && selectedNodeId !== 'root') {
            parent.children = parent.children.filter(child => child.id !== selectedNodeId);
            selectedNodeId = parent.id;
            drawForCreateMode();
        }
    });

    goUpTreeBtn.addEventListener('click', () => {
        selectedNodeId = 'root';
        drawForCreateMode();
    });

    markCorrectBtn.addEventListener('click', () => {
        const node = findNodeById(solutionTree, selectedNodeId);
        if (node) {
            node.judgement = 'correct';
            drawForCreateMode();
        }
    });

    markFailureBtn.addEventListener('click', () => {
        const node = findNodeById(solutionTree, selectedNodeId);
        if (node) {
            node.judgement = 'incorrect';
            drawForCreateMode();
        }
    });

    clearBoardBtn.addEventListener('click', resetCreateMode);

    saveProblemBtn.addEventListener('click', () => {
        const editingProblemId = saveProblemBtn.dataset.editingProblemId;
        const problemData = {
            initialBoard: initialBoardState,
            solutionTree: solutionTree, // Save the tree
            authorName: authorNameInput.value,
            authorRank: authorRankInput.value,
            difficulty: difficultySelect.value,
            finalJudgment: finalJudgmentSelect.value
        };

        if (editingProblemId) {
            const problemIndex = problems.findIndex(p => p.id === parseInt(editingProblemId));
            if (problemIndex !== -1) {
                problems[problemIndex] = { ...problems[problemIndex], ...problemData };
                saveProblems(problems);
                alert('問題が更新されました！');
            }
        } else {
            const newProblem = { id: Date.now(), ...problemData };
            problems.push(newProblem);
            saveProblems(problems);
            alert('問題が保存されました！');
        }
        resetCreateMode();
        saveProblemBtn.textContent = '問題を登録';
        delete saveProblemBtn.dataset.editingProblemId;
    });

    // --- Initial Setup ---
    createModeBtn.addEventListener('click', showCreateMode);
    // Update event listeners to pass difficulty
    startNormalModeBtn.addEventListener('click', () => showNormalMode(mainDifficultySelect.value));
    startTimeAttackModeBtn.addEventListener('click', () => startAttackMode(mainDifficultySelect.value));
    startGameBtn.addEventListener('click', () => startAttackMode(mainDifficultySelect.value)); // Also for startGameBtn
    resetGameBtn.addEventListener('click', resetGame);

    // Initialize all boards
    [goBoard, gameBoard, createBoard, startScreenBoard].forEach(board => {
        if(board) initializeBoard(board);
    });

    // Show start screen initially
    hideAllModes();
    startScreen.classList.remove('hidden');
    // Explicitly draw an empty board for the start screen
    drawStones(startScreenBoard, Array(boardSize).fill(0).map(() => Array(boardSize).fill(0)));

});