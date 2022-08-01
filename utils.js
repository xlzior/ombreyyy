const colorDiff = require('color-diff');

/**
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @returns random integer between min and max (both inclusive)
 */
const randBetween = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1))
}

const randomColour = () => {
  return [randBetween(0, 255), randBetween(0, 255), randBetween(0, 255)]
}

const rgbToLab = (rgb) => {
  const [R, G, B] = rgb;
  return colorDiff.rgb_to_lab({ R, G, B })
}

const rgbDiff = (rgb1, rgb2) => {
  return colorDiff.diff(rgbToLab(rgb1), rgbToLab(rgb2));
}

const isDistinct = (rgb1, rgb2) => {
  return rgbDiff(rgb1, rgb2) > 40;
}

const randomDistinctColours = (n = 4) => {
  const result = [];
  while (result.length < n) {
    const candidate = randomColour();
    if (result.every(colour => isDistinct(candidate, colour))) {
      result.push(candidate);
    }
  }
  return result;
}

module.exports = {
  randomDistinctColours
}