//formula from wikipedia
function getIntersection(p1, p2, p3, p4) {
  const oneTop = (p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x);
  const twoTop = (p3.y - p1.y) * (p1.x - p2.x) - (p3.x - p1.x) * (p1.y - p2.y);
  const bot = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  if (bot != 0) {
    const a = oneTop / bot;
    const b = twoTop / bot;
    if (a >= 0 && b >= 0 && a <= 1 && b <= 1) {
      return {
        x: linExtrap(p1.x, p2.x, a),
        y: linExtrap(p1.y, p2.y, a),
        offset: a,
      };
    }
  }
  return null;
}

//linear extrapolation
function linExtrap(start, end, increm) {
  return start + (end - start) * increm;
}
