import Pyramid from './Pyramid';

const getShape = (name) => {
  switch (name) {
    case 'Pyramid':
    default:
      return Pyramid;
  }
};

export { getShape };
