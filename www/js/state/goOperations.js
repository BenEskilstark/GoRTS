import {
  forEachBoardPos, belongsToGroup, getNumLiberties,
  getNumPiecesByClientID, getEyes,
} from '../selectors/goSelectors.js';
import {config} from '../config.js';
import {encodePos, decodePos} from '../utils/positions.js';


export const placePiece = (state, piece) => {
  state.pieces[encodePos(piece)] = piece;
  computeGroupBelonging(state, piece);
  updateLiberties(state);
  removeDeadGroups(state);
  computeEyes(state);
  computeScores(state);
};

export const dropPiece = (state, piece) => {
  state.fallingPieces[encodePos(piece)] = {...piece};
};


const updateLiberties = (state) => {
  for (const group of state.groups) {
    group.liberties = getNumLiberties(state, group);
  }
};

const computeEyes = (state) => {
  state.groups.forEach((group, i) => {
    group.eyes = getEyes(state, group, i);
  });
}

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
      const {clientID} = state.pieces[encodedPiece];
      state.lost[clientID]++;
      delete state.pieces[encodedPiece];
    }
  }

  state.groups = nextGroups;
};

const computeScores = (state) => {
  for (const clientID in state.score) {
    const numPieces = getNumPiecesByClientID(state, clientID);
    state.score[clientID] = numPieces - state.lost[clientID];
  }
};

const computeGroupBelonging = (state, piece) => {
  const {groups} = state;
  const {x, y, clientID} = piece;
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
    state.groups.push({clientID, pieces: [encodePos(piece)], liberties: 1});
  } else {
    const group = mergeGroups(state, groupsJoined);
    group.pieces.push(encodePos(piece));
    state.groups.push(group);
  }
}

const mergeGroups = (state, groups) => {
  const mergedGroup = {clientID: groups[0].clientID, pieces: [], liberties: 1};
  for (const group of groups) {
    mergedGroup.pieces = mergedGroup.pieces.concat(group.pieces);
  }
  return mergedGroup;
};
