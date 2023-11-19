
export const encodePos = ({x, y}) => {
  return `${x},${y}`;
}

export const decodePos = (posStr) => {
  const [x, y] = posStr.split(',');
  return {x: parseInt(x), y: parseInt(y)};
}
