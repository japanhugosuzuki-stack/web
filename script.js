"use strict";

// ===============================
// マルバツゲーム（プレイヤー vs CPU）
// CPUはミニマックス法で最適手を選ぶ
// ===============================

// 記号の定義
const HUMAN = "X";
const CPU = "O";
const EMPTY = "";

// 勝利パターン（3つ揃えば勝ち）
const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// DOM要素の取得
const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetButton = document.getElementById("resetButton");

// 盤面データ（0〜8の9マス）
let board = Array(9).fill(EMPTY);

// ゲーム終了フラグ（trueなら操作を受け付けない）
let isGameOver = false;

// CPU思考中フラグ（連打で誤操作しないため）
let isCpuThinking = false;

// -------------------------------
// 初期化処理
// -------------------------------
function initGame() {
  board = Array(9).fill(EMPTY);
  isGameOver = false;
  isCpuThinking = false;
  statusElement.textContent = "あなたの手番です（X）";

  createBoardUI();
}

// 盤面のボタン（9マス）を生成する
function createBoardUI() {
  boardElement.innerHTML = "";

  for (let i = 0; i < 9; i += 1) {
    const cellButton = document.createElement("button");
    cellButton.className = "cell";
    cellButton.type = "button";
    cellButton.dataset.index = String(i);
    cellButton.textContent = board[i];
    cellButton.addEventListener("click", handleHumanMove);
    boardElement.appendChild(cellButton);
  }
}

// 盤面表示を最新のboard配列に合わせる
function renderBoard() {
  const cells = boardElement.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.disabled = isGameOver || isCpuThinking || board[index] !== EMPTY;
  });
}

// -------------------------------
// プレイヤーの手
// -------------------------------
function handleHumanMove(event) {
  // 終了時またはCPU思考中は無効
  if (isGameOver || isCpuThinking) return;

  const index = Number(event.currentTarget.dataset.index);

  // すでに埋まっているマスには置けない
  if (board[index] !== EMPTY) return;

  board[index] = HUMAN;
  renderBoard();

  // 勝敗・引き分け判定
  if (checkWinner(board, HUMAN)) {
    statusElement.textContent = "あなたの勝ちです！";
    isGameOver = true;
    renderBoard();
    return;
  }

  if (isDraw(board)) {
    statusElement.textContent = "引き分けです！";
    isGameOver = true;
    renderBoard();
    return;
  }

  // CPUの手番へ
  isCpuThinking = true;
  statusElement.textContent = "CPUが考え中です...";
  renderBoard();

  // 少し待ってからCPUが打つ（見た目として分かりやすくする）
  setTimeout(() => {
    makeCpuMove();
  }, 250);
}

// -------------------------------
// CPUの手（ミニマックス法）
// -------------------------------
function makeCpuMove() {
  const bestMove = findBestMove(board);
  board[bestMove] = CPU;

  // CPUの手を反映後に判定
  if (checkWinner(board, CPU)) {
    statusElement.textContent = "CPUの勝ちです。";
    isGameOver = true;
    isCpuThinking = false;
    renderBoard();
    return;
  }

  if (isDraw(board)) {
    statusElement.textContent = "引き分けです！";
    isGameOver = true;
    isCpuThinking = false;
    renderBoard();
    return;
  }

  // 次はプレイヤーの手番
  isCpuThinking = false;
  statusElement.textContent = "あなたの手番です（X）";
  renderBoard();
}

// CPUにとって最善の手を探す
function findBestMove(currentBoard) {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i += 1) {
    if (currentBoard[i] === EMPTY) {
      currentBoard[i] = CPU;
      const score = minimax(currentBoard, 0, false);
      currentBoard[i] = EMPTY;

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

// ミニマックス本体
// isMaximizing:
// true  -> CPUの番（最大化）
// false -> 人間の番（最小化）
function minimax(currentBoard, depth, isMaximizing) {
  // 終端状態の評価
  if (checkWinner(currentBoard, CPU)) return 10 - depth;
  if (checkWinner(currentBoard, HUMAN)) return depth - 10;
  if (isDraw(currentBoard)) return 0;

  if (isMaximizing) {
    // CPUはスコアを最大化したい
    let bestScore = -Infinity;

    for (let i = 0; i < 9; i += 1) {
      if (currentBoard[i] === EMPTY) {
        currentBoard[i] = CPU;
        const score = minimax(currentBoard, depth + 1, false);
        currentBoard[i] = EMPTY;
        bestScore = Math.max(bestScore, score);
      }
    }

    return bestScore;
  }

  // 人間はCPUにとって不利な手を選ぶ（最小化）
  let bestScore = Infinity;

  for (let i = 0; i < 9; i += 1) {
    if (currentBoard[i] === EMPTY) {
      currentBoard[i] = HUMAN;
      const score = minimax(currentBoard, depth + 1, true);
      currentBoard[i] = EMPTY;
      bestScore = Math.min(bestScore, score);
    }
  }

  return bestScore;
}

// -------------------------------
// 判定関数
// -------------------------------

// playerが勝っているかを判定する
function checkWinner(currentBoard, player) {
  return WIN_PATTERNS.some((pattern) => {
    const [a, b, c] = pattern;
    return (
      currentBoard[a] === player &&
      currentBoard[b] === player &&
      currentBoard[c] === player
    );
  });
}

// 空きマスがなく、かつ勝者がいないなら引き分け
function isDraw(currentBoard) {
  const hasEmptyCell = currentBoard.includes(EMPTY);
  return !hasEmptyCell && !checkWinner(currentBoard, HUMAN) && !checkWinner(currentBoard, CPU);
}

// -------------------------------
// イベント登録
// -------------------------------
resetButton.addEventListener("click", initGame);

// 初回起動
initGame();
