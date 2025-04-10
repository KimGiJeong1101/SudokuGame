const board = document.getElementById("sudoku-board");

for (let i = 0; i < 81; i++) {
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 1;
  input.classList.add("cell");
  input.id = `cell-${i}`;
  input.setAttribute("autocomplete", "off");

  const row = Math.floor(i / 9);
  const col = i % 9;
  if ((col + 1) % 3 === 0 && col !== 8) input.classList.add("bold-right");
  if ((row + 1) % 3 === 0 && row !== 8) input.classList.add("bold-bottom");

  input.addEventListener("input", () => {
    const val = input.value;
    if (!/^[1-9]?$/.test(val)) input.value = "";
    validateLiveInput(); // ✅ 실시간 검사
  });

  board.appendChild(input);
}

function getPuzzle() {
  const puzzle = [];
  for (let row = 0; row < 9; row++) {
    puzzle[row] = [];
    for (let col = 0; col < 9; col++) {
      const val = document.getElementById(`cell-${row * 9 + col}`).value;
      puzzle[row][col] = val === "" ? 0 : parseInt(val);
    }
  }
  return puzzle;
}

function fillPuzzle(puzzle, lock = true) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.getElementById(`cell-${row * 9 + col}`);
      const val = puzzle[row][col];
      cell.value = val === 0 ? "" : val;
      cell.readOnly = lock && val !== 0;
      cell.classList.remove("given", "invalid");
      if (lock && val !== 0) {
        cell.classList.add("given");
      }
      cell.style.backgroundColor = lock && val !== 0 ? "#f0f0f0" : "white";
    }
  }
}

function resetBoard() {
  for (let i = 0; i < 81; i++) {
    const cell = document.getElementById(`cell-${i}`);
    cell.value = "";
    cell.readOnly = false;
    cell.style.backgroundColor = "white";
    cell.classList.remove("given", "invalid");
  }
}

function isValid(puzzle, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (puzzle[row][i] === num || puzzle[i][col] === num) return false;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (puzzle[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}

function solveSudoku(puzzle) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(puzzle, row, col, num)) {
            puzzle[row][col] = num;
            if (solveSudoku(puzzle)) return true;
            puzzle[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generatePuzzle(difficulty) {
  resetBoard();
  let puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));

  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let i = 0; i < 9; i++) puzzle[0][i] = nums[i];

  solveSudoku(puzzle);

  let leaveCount = 35;
  if (difficulty === "medium") leaveCount = 30;
  if (difficulty === "hard") leaveCount = 21;

  let puzzleWithHoles = puzzle.map((row) => row.slice());
  let toRemove = 81 - leaveCount;

  while (toRemove > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (puzzleWithHoles[row][col] !== 0) {
      puzzleWithHoles[row][col] = 0;
      toRemove--;
    }
  }

  fillPuzzle(puzzleWithHoles, true);
  validateLiveInput(); // 초기 생성 후에도 검사
}

function isInitialInputValid(puzzle) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = puzzle[row][col];
      if (num === 0) continue;
      puzzle[row][col] = 0;
      if (!isValid(puzzle, row, col, num)) {
        puzzle[row][col] = num;
        return false;
      }
      puzzle[row][col] = num;
    }
  }
  return true;
}

function validateLiveInput() {
  const puzzle = getPuzzle();
  for (let i = 0; i < 81; i++) {
    document.getElementById(`cell-${i}`).classList.remove("invalid");
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const currentVal = puzzle[row][col];
      if (currentVal === 0) continue;

      // 현재 값을 임시로 지우고 검사
      puzzle[row][col] = 0;

      if (!isValid(puzzle, row, col, currentVal)) {
        const cellId = `cell-${row * 9 + col}`;
        document.getElementById(cellId).classList.add("invalid");
      }

      puzzle[row][col] = currentVal;
    }
  }
}

document.getElementById("reset-btn").addEventListener("click", resetBoard);

document.getElementById("show-answer-btn").addEventListener("click", () => {
  const puzzle = getPuzzle();
  if (!isInitialInputValid(puzzle)) {
    alert("잘못 입력된 숫자가 있습니다 😥\n숫자 겹침이 있는지 확인해주세요!");
    return;
  }

  const copied = puzzle.map((row) => row.slice());
  if (solveSudoku(copied)) {
    fillPuzzle(copied, true);
  } else {
    alert("해결할 수 없는 퍼즐입니다 😥");
  }
});

const currentLevelDisplay = document.getElementById("current-level");

document.querySelector(".easy-btn").addEventListener("click", () => {
  generatePuzzle("easy");
  currentLevelDisplay.textContent = "현재 난이도: 초급";
});

document.querySelector(".medium-btn").addEventListener("click", () => {
  generatePuzzle("medium");
  currentLevelDisplay.textContent = "현재 난이도: 중급";
});

document.querySelector(".hard-btn").addEventListener("click", () => {
  generatePuzzle("hard");
  currentLevelDisplay.textContent = "현재 난이도: 고급";
});
