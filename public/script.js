// @ts-check

/**
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @returns random integer between min and max (both inclusive)
 */
const randBetween = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1))
}

const isBetween = (x, left, right) => {
  return left <= x && x <= right;
}

const favicons = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛️', '⬜️', '🟫']
const randomiseFavicon = () => {
  const link = document.querySelector("link[rel~='icon']");
  const selectedColour = favicons[randBetween(0, favicons.length - 1)]
  if (!link) return;
  link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${selectedColour}</text></svg>`;
}

setInterval(randomiseFavicon, 20000);

class Colour {
  constructor(rgb) {
    this.colour = rgb
  }

  static empty() {
    return new Colour([0, 0, 0])
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

  constructor(h, w, mode = 'easy') {
    this.h = h;
    this.w = w;
    this.mode = mode;
    this.xs = Array.from(Array(w).keys())
    this.ys = Array.from(Array(h).keys())
    this.coords = this.xs.flatMap(x => this.ys.map(y => [x, y]))
    this.board = this.ys.map(y => this.xs.map(x => Colour.empty()))
    this.corners = Array.from({ length: 4 }, () => Colour.empty())
    this.resize();
    this.initialise();
  }

  async initialise() {
    this.corners = await fetch('/get-corners')
      .then(response => response.json())
      .then(rgbs => rgbs.map(rgb => new Colour(rgb)))
    this.coords.forEach(([x, y]) => {
      this.board[y][x] = this.getColour(x, y)
    })
    this.shuffle(0);
    this.draw();
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
    return this.coords.every(([x, y]) => {
      return this.board[y][x].equal(this.getColour(x, y));
    });
  }

  isCorner(x, y) {
    return (x === 0 || x === this.w - 1)
      && (y === 0 || y === this.h - 1);
  }

  isFixed(x, y) {
    if (this.mode === 'easy') {
      return this.isCorner(x, y) ||
        (isBetween(x, 1, this.w - 2) && isBetween(y, 1, this.h - 2))
    }
    return this.isCorner(x, y)
  }

  randomCoordinate() {
    const x = randBetween(0, this.w - 1);
    const y = randBetween(0, this.h - 1);
    return this.isFixed(x, y) ? this.randomCoordinate() : [x, y];
  }

  shuffle(n = this.h * this.w) {
    Array.from({ length: n }, () => {
      const [x1, y1] = this.randomCoordinate();
      const [x2, y2] = this.randomCoordinate();
      this.swapTiles(x1, y1, x2, y2, false);
    })
  }

  getTile(x, y) {
    return document.getElementById(`tile-${x}-${y}`);
  }

  getEndScreen() {
    return document.getElementById('end-screen')
  }

  setSelection(x, y) {
    this.selectedTile[0] = x;
    this.selectedTile[1] = y;
    this.getTile(x, y)?.classList.add('selected')
  }

  resetSelection() {
    const [x, y] = this.selectedTile;
    this.getTile(x, y)?.classList.remove('selected');
    this.setSelection(-1, -1);
  }

  hasSelection() {
    return this.selectedTile[0] != -1 && this.selectedTile[1] != -1;
  }

  swapTiles(x1, y1, x2, y2, render = true) {
    const temp = this.board[y1][x1];
    this.board[y1][x1] = this.board[y2][x2];
    this.board[y2][x2] = temp;

    if (render) {
      this.getTile(x1, y1)?.style.setProperty(
        'background-color', this.board[y1][x1].toString())
      this.getTile(x2, y2)?.style.setProperty(
        'background-color', this.board[y2][x2].toString())

      this.checkWin();
    }
  }

  resize() {
    this.pixelWidth = Math.floor(Math.min(
      (window.innerHeight - 150) / this.h,
      window.innerWidth / this.w))
    this.coords.forEach(([x, y]) => {
      const tile = this.getTile(x, y);
      tile?.style.setProperty('height', `${this.pixelWidth}px`)
      tile?.style.setProperty('width', `${this.pixelWidth}px`)
    })
  }

  draw() {
    this.coords.forEach(([x, y]) => {
      const tile = this.getTile(x, y);
      if (!tile) return;

      tile.style.backgroundColor = this.board[y][x].toString();
      if (this.isFixed(x, y)) {
        tile.classList.add('fixed');
      } else {
        tile.onclick = () => {
          if (this.hasSelection()) {
            const [x2, y2] = this.selectedTile;
            this.swapTiles(x, y, x2, y2);
            this.resetSelection();
          } else {
            this.setSelection(x, y);
          }
        }
      }
    })

    this.checkWin();
  }

  checkWin() {
    this.getEndScreen()?.style.setProperty(
      'visibility',
      this.isSolved() ? 'visible' : 'hidden')
  }
}

const queryParams = new URLSearchParams(window.location.search);
let mode = queryParams.get('mode') || 'easy';
if (!['easy', 'normal', 'hard'].includes(mode)) {
  mode = 'easy';
}

const difficulties = {
  'easy': [7, 5],
  'normal': [7, 5],
  'hard': [9, 6],
}

const [h, w] = difficulties[mode];

const board = new Board(h, w, mode);

const nextPuzzle = () => board.initialise();

window.onresize = () => {
  board.resize();
}
