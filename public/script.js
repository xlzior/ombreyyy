// @ts-check

/**
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @returns random integer between min and max (both inclusive)
 */
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

class Colour {
  constructor(rgb) {
    this.colour = rgb
  }

  static random() {
    return new Colour([randBetween(0, 255), randBetween(0, 255), randBetween(0, 255)])
  }

  static randomDistinct(n = 4) {
    const result = [];
    while (result.length < n) {
      const candidate = Colour.random();
      if (result.every(colour => candidate.distinct(colour))) {
        result.push(candidate);
      }
    }
    return result;
  }

  /**
   * @param {Colour} other other colour to compare to
   */
  equal(other) {
    for (let c = 0; c < 3; c++) {
      if (this.colour[c] !== other.colour[c]) {
        return false;
      }
    }
    return true;
  }

  /**
   * @param {Colour} other other colour to compare to
   */
  distinct(other) {
    return this.colour
      .map((c, i) => Math.abs(c - other.colour[i]))
      .reduce((a, b) => a + b) > 200;
  }

  get(index) {
    return this.colour[index]
  }

  toString() {
    return `rgb(${this.colour.join(',')})`
  }
}

class Board {
  h = 0;
  w = 0;
  selectedTile = [-1, -1];

  constructor(h, w) {
    this.h = h;
    this.w = w;
    this.initialise();
  }

  initialise() {
    this.corners = Colour.randomDistinct(4);
    this.boardColours = [];

    for (let y = 0; y < this.h; y++) {
      const row = []
      for (let x = 0; x < this.w; x++) {
        row.push(this.getColour(x, y));
      }
      this.boardColours.push(row)
    }
    this.shuffle(1);
    this.resize()
  }

  getColour(x, y) {
    const { h, w } = this;
    const rgb = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      rgb[c] = (1 - y / (h - 1)) * (1 - x / (w - 1)) * this.corners[0].get(c)
        + (1 - y / (h - 1)) * (x / (w - 1)) * this.corners[1].get(c)
        + (y / (h - 1)) * (1 - x / (w - 1)) * this.corners[2].get(c)
        + (y / (h - 1)) * (x / (w - 1)) * this.corners[3].get(c)
    }
    return new Colour(rgb);
  }

  isSolved() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (!this.boardColours[y][x].equal(this.getColour(x, y))) {
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

  resize() {
    this.pixelWidth = Math.floor(Math.min(
      (window.innerHeight - 100) / this.h,
      window.innerWidth / this.w))
    this.draw();
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
        tile.style = [
          `height: ${this.pixelWidth}px;`,
          `width: ${this.pixelWidth}px;`,
          `background-color: ${this.boardColours[y][x].toString()};`
        ].join(' ')

        if (!this.isCorner(x, y)) {
          tile.onmousedown = () => {
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

    const endScreen = document.createElement('div')
    endScreen.className = 'end-screen'
    if (this.isSolved()) {
      const solved = document.createElement('p')
      solved.textContent = '✅ Solved!'
      const nextPuzzle = document.createElement('button')
      nextPuzzle.addEventListener('click', () => {
        this.initialise()
      })
      nextPuzzle.textContent = 'Next ⏩'
      endScreen.appendChild(solved)
      endScreen.appendChild(nextPuzzle)
    }
    root.appendChild(endScreen)
  }
}

const board = new Board(7, 5);

window.onresize = () => {
  board.resize();
}
