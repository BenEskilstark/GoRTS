import {encodePos, decodePos} from '../utils/positions.js';
import {config} from '../config.js';


export const forEachBoardPos = (state, fn) => {
  const {width, height} = state;
  for (let x = 1; x < width; x++) {
    for (let y = 1; y < height; y++) {
      fn({x, y});
    }
  }
}

export const belongsToAnyGroup = ({groups}, piece) => {
  for (const group of groups) {
    if (belongsToGroup(group, piece)) {
      return true;
    }
  }
  return false;
}

export const getFreePositions = (state) => {
  const freePositions = [];
  forEachBoardPos(state, (pos) => {
    if (
      !state.pieces[encodePos(pos)] &&
      !state.fallingPieces[encodePos(pos)]
    ) {
      freePositions.push(pos);
    }
  });
  return freePositions;
}

const areNeighbors = (pieceA, pieceB) => {
  if (pieceA.x == pieceB.x && Math.abs(pieceA.y - pieceB.y) == 1) {
    return true;
  }
  if (pieceA.y == pieceB.y && Math.abs(pieceA.x - pieceB.x) == 1) {
    return true;
  }
  return false;
};

const getNeighborPositions = (width, height, piece) => {
  return [
    {x: piece.x, y: piece.y + 1},
    {x: piece.x, y: piece.y - 1},
    {x: piece.x + 1, y: piece.y},
    {x: piece.x - 1, y: piece.y},
  ].filter(pos => pos.x > 0 && pos.x < width && pos.y > 0 && pos.y < height);
}

export const belongsToGroup = (group, piece) => {
  if (group.clientID != piece.clientID) return false;
  for (const encodedPiece of group.pieces) {
    if (areNeighbors(decodePos(encodedPiece), piece)) {
      return true;
    }
  }
  return false;
}

export const getNumLiberties = (state, group) => {
  const {width, height} = state;

  let numLiberties = 0;
  for (const encodedPiece of group.pieces) {
    const neighbors = getNeighborPositions(
      width, height, decodePos(encodedPiece));
    numLiberties += neighbors.filter(pos => !state.pieces[encodePos(pos)])
      .length;
  }

  return numLiberties;
}

export const getEyes = ({width, height, pieces, groups}, group, groupIndex) => {
  const eyes = {};
  for (const encodedPiece of group.pieces) {
    const emptyNeighbors = getNeighborPositions(
      width, height, decodePos(encodedPiece)
    ).filter(pos => !pieces[encodePos(pos)]);
    for (const n of emptyNeighbors) {
      const nsNeighbors = getNeighborPositions(width, height, n);
      const isMyPiece = pos => {
        return pieces[encodePos(pos)]?.clientID == group.clientID;
      }
      if (
        nsNeighbors.filter(isMyPiece).length == nsNeighbors.length &&
        nsNeighbors.every(piece => getGroupIndex({groups}, piece) == groupIndex)
      ) {
        eyes[encodePos(n)] = true;
      }
    }
  }

  return eyes;
}

const getGroupIndex = ({groups}, piece) => {
  if (!piece) return -1;
  const encoded = encodePos(piece);
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (const ePos of group.pieces) {
      if (ePos == encoded) {
        return i;
      }
    }
  }
  console.log("didn't find");
}

export const isLegalPlacement = (state, piece) => {
  const {width, height, pieces, fallingPieces, actionQueue} = state;
  const {x, y, clientID} = piece;
  // outside the border
  if (x == 0 || x == width || y == 0 || y == height) return false;
  // already occupied
  if (pieces[encodePos({x, y})]) return false;
  // already dropping a piece there
  if (fallingPieces[encodePos({x, y})]) return false;

  // already enqueued an action to place a piece there
  const e = encodePos;
  if (actionQueue.find(a => pieces[e(a)] || fallingPieces[e(a)])?.clientID == clientID)
    return false;

  return true;
}

export const getNumPiecesByClientID = (state, clientID) => {
  let numPieces = 0;
  for (const ePos in state.pieces) {
    if (state.pieces[ePos].clientID == clientID) {
      numPieces++;
    }
  }
  return numPieces;
};


// for debugging
export const getPieceGroupIndex = (state, piece) => {
  for (let i = 0; i < state.groups.length; i++) {
    const group = state.groups[i];
    for (const encodedPiece of group.pieces) {
      if (encodePos(piece) == encodedPiece) {
        return i;
      }
    }
  }
  console.log("piece not in a group!", piece);
  return -1;
}

