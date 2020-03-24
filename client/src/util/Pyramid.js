const getRow = idx => {
  return Math.floor(0.5 + 0.5 * Math.sqrt(1 + 8 * idx));
};

const getIdx0 = row => {
  return (row * (row - 1)) / 2;
};

const getRowIdxs = row => {
  const idx0 = getIdx0(row);
  return [...Array(row).keys()].map(key => idx0 + key);
};

const getRowFaces = (row, faces) => {
  return getRowIdxs(row).map(idx => ({ idx: idx, face: faces[idx] }));
};

export { getRow, getIdx0, getRowIdxs, getRowFaces };
