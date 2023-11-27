import {
  forEachBoardPos, belongsToGroup, getNumLiberties,
  msToTurns,
} from '../selectors/selectors.js';
import {config} from '../config.js';
import {encodePos, decodePos} from '../utils/positions.js';


export const placePiece = (state, piece) => {
  state.pieces[encodePos(piece)] = piece;
  computeGroupBelonging(state, piece);
  updateLiberties(state);
  removeDeadGroups(state);
  computeScores(state);
};

export const dropPiece = (state, piece) => {
  state.fallingPieces[encodePos(piece)] = {
    ...piece, startTurns: piece.turns,
  };
};


const updateLiberties = (state) => {
  for (const group of state.groups) {
    group.liberties = getNumLiberties(state, group);
  }
};

const removeDeadGroups = (state) => {
  const nextGroups = [];
  const deadGroups = [];
  for (const group of state.groups) {
    if (group.liberties <= 0) {
      deadGroups.push(group);
    } else {
      nextGroups.push(group);
    }
  }

  for (const group of deadGroups) {
    for (const encodedPiece of group.pieces) {
      delete state.pieces[encodedPiece];
      // TODO: update score here
    }
  }

  state.groups = nextGroups;
};

const computeScores = (state) => {
  // TODO
};

const computeGroupBelonging = (state, piece) => {
  const {groups} = state;
  const {x, y, color} = piece;
  const groupsJoined = [];
  const nextGroups = [];
  for (const group of groups) {
    if (belongsToGroup(group, piece)) {
      groupsJoined.push(group);
    } else {
      nextGroups.push(group);
    }
  }
  state.groups = nextGroups;
  if (groupsJoined.length == 0) {
    state.groups.push({color, pieces: [encodePos(piece)], liberties: 1});
  } else {
    const group = mergeGroups(state, groupsJoined);
    group.pieces.push(encodePos(piece));
    state.groups.push(group);
  }
}

const mergeGroups = (state, groups) => {
  const mergedGroup = {color: groups[0].color, pieces: [], liberties: 1};
  for (const group of groups) {
    mergedGroup.pieces = mergedGroup.pieces.concat(group.pieces);
  }
  return mergedGroup;
};
