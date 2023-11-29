
import {config} from '../config.js';
import {arrayToMapKeys} from '../utils/helpers.js';
import {newDuration} from '../selectors/durationSelectors.js';

export const initGameState = (players, clientID) => {
  return {
    /////////////
    // immutable game state
    players, // Array<ClientID>

    width: config.boardSize,
    height: config.boardSize,


    /////////////
    // local game state
    turnIndex: 0, // index of player whose turn it is
    turn: 0,

    mouseDown: false,

    myTurn: players.indexOf(clientID) == 0,
    actionQueue: [], // Array<Action>

    curTurnRate: 24, // total number of turns taken per second
    avgTurnRate: 24,
    startTime: Date.now(),
    lastTurnEndTime: Date.now(), // the time when my last turn ended


    /////////////
    // global game state that must be shared
    colors: arrayToMapKeys(players, (clientID, i) => config.colors[i]),
    mana: arrayToMapKeys(players, () => config.startingMana),
    nextMana: arrayToMapKeys(players, () => newDuration({turn: 0}, 10)), // turns until next mana regen

    lost: arrayToMapKeys(players, () => 0), // how many pieces you've lost
    score: arrayToMapKeys(players, () => 0),

    fallingPieces: {}, // {EncodedPos: {clientID, x, y, turns}}
    pieces: {}, // {EncodedPos: {clientID, x, y}}
    groups: [], // Array<{clientID, pieces: Array<EncodedPos>, liberties: Number}>
  };
}
