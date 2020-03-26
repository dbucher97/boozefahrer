const stack = [
  "AS",
  "AC",
  "AD",
  "AH",
  "KS",
  "KC",
  "KD",
  "KH",
  "QS",
  "QC",
  "QD",
  "QH",
  "JS",
  "JC",
  "JD",
  "JH",
  "TS",
  "TC",
  "TD",
  "TH",
  "9S",
  "9C",
  "9D",
  "9H",
  "8S",
  "8C",
  "8D",
  "8H",
  "7S",
  "7C",
  "7D",
  "7H",
  "6S",
  "6C",
  "6D",
  "6H",
  "5S",
  "5C",
  "5D",
  "5H",
  "4S",
  "4C",
  "4D",
  "4H",
  "3S",
  "3C",
  "3D",
  "3H",
  "2S",
  "2C",
  "2D",
  "2H",
];

const shuffle = (a) => {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
};

const randomStack = (lowest) => {
  return shuffle(stack.slice(0, 4 * (stack.length / 4 - (lowest - 2))));
};

module.exports = { randomStack };
