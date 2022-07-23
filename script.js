const height = 7;
const width = 5;

const topLeft = [50, 168, 82];
const topRight = [20, 40, 115];
const bottomLeft = [167, 0, 196];
const bottomRight = [250, 250, 250];

const getColour = (x, y) => {
  const colour = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    colour[c] = (1 - y / (height - 1)) * (1 - x / (width - 1)) * topLeft[c]
      + (1 - y / (height - 1)) * (x / (width - 1)) * topRight[c]
      + (y / (height - 1)) * (1 - x / (width - 1)) * bottomLeft[c]
      + (y / (height - 1)) * (x / (width - 1)) * bottomRight[c]
  }
  return colour;
}

const boardColours = [];
for (let y = 0; y < height; y++) {
  const row = []
  for (let x = 0; x < width; x++) {
    row.push(getColour(x, y));
  }
  boardColours.push(row)
}

const isEqual = (colour1, colour2) => {
  for (let c = 0; c < 3; c++) {
    if (colour1[c] !== colour2[c]) {
      return false;
    }
  }
  return true;
}

const isSolved = () => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isEqual(boardColours[y][x], getColour(x, y))) {
        return false;
      }
    }
  }
  return true;
}

const randBetween = (min, max) => {
  return min + Math.floor(Math.random() * (max - min))
}

const isCorner = (x, y) => {
  return (x === 0 || x === width - 1) && (y === 0 || y === height - 1)
}

const randomCoordinate = () => {
  const x = randBetween(0, width - 1);
  const y = randBetween(0, height - 1);
  return isCorner(x, y) ? randomCoordinate() : [x, y];
}

const shuffleBoard = () => {
  for (let i = 0; i < 5; i++) {
    const [x1, y1] = randomCoordinate();
    const [x2, y2] = randomCoordinate();
    swapTiles(x1, y1, x2, y2);
  }
}

let selectedTile = [-1, -1];

const setSelection = (x, y) => {
  selectedTile[0] = x;
  selectedTile[1] = y;
  drawBoard();
}

const resetSelection = () => setSelection(-1, -1);

const isSelected = (x, y) => selectedTile[0] === x && selectedTile[1] === y;

const swapTiles = (x1, y1, x2, y2) => {
  const temp = boardColours[y1][x1];
  boardColours[y1][x1] = boardColours[y2][x2];
  boardColours[y2][x2] = temp;
}

const drawBoard = () => {
  const board = document.createElement('div')
  board.className = 'board'

  for (let y = 0; y < height; y++) {
    const row = document.createElement('div')
    row.className = 'row'
    for (let x = 0; x < width; x++) {
      const tile = document.createElement('div')
      tile.className = `tile ${isSelected(x, y) ? 'selected' : ''}`
      tile.style = `background-color: rgb(${boardColours[y][x].join(',')});`
      tile.onclick = () => {
        if (selectedTile[0] != -1) {
          const [x2, y2] = selectedTile;
          swapTiles(x, y, x2, y2);
          resetSelection();
        } else {
          setSelection(x, y);
        }
        drawBoard();
      }
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
  const root = document.getElementById("root")
  root.replaceChildren(board)
  if (isSolved(board)) {
    root.appendChild(document.createTextNode('Solved!'))
  }
}

shuffleBoard();
drawBoard();
