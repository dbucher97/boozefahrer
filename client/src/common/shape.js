const Pyramid = require('./Pyramid');

const getShape = (name) => {
  switch (name) {
    case 'Pyramid':
    default:
      return Pyramid;
  }
};

module.exports = { getShape };
