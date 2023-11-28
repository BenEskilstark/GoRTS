
export const mouseToGrid = ({width, height}, ev, canvas) => {
  if (!canvas) return;
  const sqSize = canvas.getBoundingClientRect().width / width;

  return {
    x: Math.round(ev.offsetX / sqSize),
    y: Math.round(ev.offsetY / sqSize),
  };
}
