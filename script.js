// @ts-check

const isEqual = (colour1, colour2) => {
  for (let c = 0; c < 3; c++) {
    if (colour1[c] !== colour2[c]) {
      return false;
    }
  }
  return true;
}

const randBetween = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1))
}

const favicons = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛️', '⬜️', '🟫']
const randomiseFavicon = () => {
  let link = document.querySelector("link[rel~='icon']");
  const selectedColour = favicons[randBetween(0, favicons.length - 1)]
  link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${selectedColour}</text></svg>`;
}

setInterval(randomiseFavicon, 20000);

class Board {
  h = 0;
  w = 0;
  selectedTile = [-1, -1];

  constructor(h, w) {
    this.h = h;
    this.w = w;
    this.boardColours = [];
    for (let y = 0; y < h; y++) {
      const row = []
      for (let x = 0; x < w; x++) {
        row.push(this.getColour(x, y));
      }
      this.boardColours.push(row)
    }
  }

  getColour(x, y) {
    const topLeft = [50, 168, 82];
    const topRight = [20, 40, 115];
    const bottomLeft = [167, 0, 196];
    const bottomRight = [250, 250, 250];

    const { h, w } = this;
    const colour = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      colour[c] = (1 - y / (h - 1)) * (1 - x / (w - 1)) * topLeft[c]
        + (1 - y / (h - 1)) * (x / (w - 1)) * topRight[c]
        + (y / (h - 1)) * (1 - x / (w - 1)) * bottomLeft[c]
        + (y / (h - 1)) * (x / (w - 1)) * bottomRight[c]
    }
    return colour;
  }

  isSolved() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (!isEqual(this.boardColours[y][x], this.getColour(x, y))) {
          return false;
        }
      }
    }
    return true;
  }

  isCorner = (x, y) => {
    return (x === 0 || x === this.w - 1) && (y === 0 || y === this.h - 1)
  }

  randomCoordinate() {
    const x = randBetween(0, this.w - 1);
    const y = randBetween(0, this.h - 1);
    return this.isCorner(x, y) ? this.randomCoordinate() : [x, y];
  }

  shuffle(n = 2 * this.h * this.w) {
    for (let i = 0; i < n; i++) {
      const [x1, y1] = this.randomCoordinate();
      const [x2, y2] = this.randomCoordinate();
      this.swapTiles(x1, y1, x2, y2);
    }
  }

  setSelection(x, y) {
    this.selectedTile[0] = x;
    this.selectedTile[1] = y;
    this.draw();
  }

  resetSelection() {
    this.setSelection(-1, -1);
  }

  isSelected(x, y) {
    return this.selectedTile[0] === x && this.selectedTile[1] === y;
  }

  swapTiles(x1, y1, x2, y2) {
    const temp = this.boardColours[y1][x1];
    this.boardColours[y1][x1] = this.boardColours[y2][x2];
    this.boardColours[y2][x2] = temp;
  }

  draw() {
    const board = document.createElement('div')
    board.className = 'board'

    for (let y = 0; y < this.h; y++) {
      const row = document.createElement('div')
      row.className = 'row'
      for (let x = 0; x < this.w; x++) {
        const tile = document.createElement('div')
        const classes = ['tile'];
        if (this.isSelected(x, y)) classes.push('selected');
        if (this.isCorner(x, y)) {
          classes.push('fixed');
          const dot = document.createElement('div');
          dot.className = 'dot'
          tile.appendChild(dot)
        }
        tile.className = classes.join(' ');
        tile.style = `background-color: rgb(${this.boardColours[y][x].join(',')});`

        if (!this.isCorner(x, y)) {
          tile.onclick = () => {
            if (this.selectedTile[0] != -1) {
              const [x2, y2] = this.selectedTile;
              this.swapTiles(x, y, x2, y2);
              this.resetSelection();
            } else {
              this.setSelection(x, y);
            }
            this.draw();
          }
        }
        row.appendChild(tile);
      }
      board.appendChild(row);
    }
    const root = document.getElementById("root")
    root.replaceChildren(board)
    if (this.isSolved()) {
      root.appendChild(document.createTextNode('Solved!'))
    }
  }
}

const board = new Board(7, 5);
board.shuffle();
board.draw();
