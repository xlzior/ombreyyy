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
    this.board = [];

    for (let y = 0; y < this.h; y++) {
      const row = []
      for (let x = 0; x < this.w; x++) {
        row.push(this.getColour(x, y));
      }
      this.board.push(row)
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
        if (!this.board[y][x].equal(this.getColour(x, y))) {
          return false;
        }
      }
    }
    return true;
  }

  isCorner = (x, y) => {
    return (x === 0 || x === this.w - 1)
      && (y === 0 || y === this.h - 1);
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

  swapTiles(x1, y1, x2, y2) {
    const temp = this.board[y1][x1];
    this.board[y1][x1] = this.board[y2][x2];
    this.board[y2][x2] = temp;
  }

  resize() {
    this.pixelWidth = Math.floor(Math.min(
      (window.innerHeight - 100) / this.h,
      window.innerWidth / this.w))
    this.draw();
  }

  draw() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const tile = this.getTile(x, y);
        tile?.style.setProperty('height', `${this.pixelWidth}px`)
        tile?.style.setProperty('width', `${this.pixelWidth}px`)
        tile?.style.setProperty('background-color', `${this.board[y][x].toString()}`)

        if (!this.isCorner(x, y)) {
          tile.onmousedown = () => {
            if (this.selectedTile[0] != -1) {
              const [x2, y2] = this.selectedTile;
              this.swapTiles(x, y, x2, y2);
              this.draw();
              this.resetSelection();
            } else {
              this.setSelection(x, y);
            }
          }
        }
      }
    }

    this.getEndScreen()?.style.setProperty(
      'visibility',
      this.isSolved() ? 'visible' : 'hidden')
  }
}

const board = new Board(7, 5);

const nextPuzzle = () => board.initialise();

window.onresize = () => {
  board.resize();
}
