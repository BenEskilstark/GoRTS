import {placePiece, dropPiece} from '../state/goOperations.js';
import {isLegalPlacement, msToTurns} from '../selectors/selectors.js';
import {config} from '../config.js';
import {encodePos, decodePos} from '../utils/positions.js';

export const rootReducer = (state, action) => {
  if (state === undefined) state = initState();

  switch (action.type) {
    case 'END_TURN': {
      const turnIndex = (state.turnIndex + 1) % state.players.length;
      const justEndedMyTurn = state.myTurn;
      const justStartedMyTurn = state.players[turnIndex] == state.clientID;

      // update falling pieces
      const nextFallingPieces = {};
      for (const ePos in state.fallingPieces) {
        const piece = state.fallingPieces[ePos];
        piece.turns--;
        if (piece.turns <= 0) {
          placePiece(state, piece);
        } else {
          nextFallingPieces[ePos] = piece;
        }
      }
      state.fallingPieces = nextFallingPieces;

      // update mana regeneration
      state.nextMana--;
      if (justStartedMyTurn) {
        if (state.nextMana <= 0) {
          state.mana = Math.min(state.mana + 1, config.maxMana);
          state.nextMana = msToTurns(state, config.manaRegenRate);
        }
      }

      return {
        ...state,
        turn: state.turn + 1,
        myTurn: justStartedMyTurn,
        turnIndex,
        // if I just ended my turn then record the time
        curTurnRate: justEndedMyTurn
          ? 1000 / (Date.now() - state.lastTurnEndTime + 1) * state.players.length
          : state.curTurnRate,
        avgTurnRate: 1000 / ((Date.now() - state.startTime + 1) / state.turn),
        lastTurnEndTime: justEndedMyTurn ? Date.now() : state.lastTurnEndTime,
      };
    }
    case 'DROP_PIECE': {
      const {x, y, color, turns} = action;
      if (isLegalPlacement(state, action)) {
        dropPiece(state, {x, y, color, turns});
      }
      return state;
    }
    case 'PLACE_PIECE': {
      const {x, y, color} = action;
      if (isLegalPlacement(state, action)) {
        placePiece(state, {x, y, color});
      }
      return state;
    }

    case 'QUEUE_ACTION': {
      state.actionQueue.push(action.action);
      return state;
    }
    case 'CLEAR_ACTION_QUEUE':
      return {...state, actionQueue: []};

    case 'LEAVE_SESSION': {
      if (action.clientID == state.clientID) {
        state.sessionID = null;
      }
      state.sessions = action.sessions;
      return state;
    }
    case 'START_SESSION': { // your session is starting
      const session = state.sessions[state.sessionID];
      return {
        ...state,
        screen: 'GAME',
        ...initGameState(session.clients, state.clientID),
      };
    }
    default:
      return state;
  }
};

export const initState = () => {
  return {
    screen: 'LOBBY', // | 'GAME'
    sessions: {}, // sessionID -> {id: SessionID, clients: Array<ClientID>, started: Bool}
    sessionID: null, // session I am in
    numConnectedClients: 0,
    clientID: null,
    realtime: config.isRealtime,
  };
}

export const initGameState = (players, clientID) => {
  return {
    players, // Array<ClientID>

    width: config.boardSize,
    height: config.boardSize,

    turnIndex: 0, // index of player whose turn it is
    turn: 0,

    mouseDown: false,

    myTurn: players.indexOf(clientID) == 0,
    color: config.colors[players.indexOf(clientID)],
    actionQueue: [], // Array<Action>

    curTurnRate: 24, // total number of turns taken per second
    avgTurnRate: 24,
    startTime: Date.now(),
    lastTurnEndTime: Date.now(), // the time when my last turn ended

    mana: config.startingMana,
    nextMana: 50, // turns until next mana regen

    fallingPieces: {}, // {EncodedPos: {color, x, y, turns}}
    pieces: {}, // {EncodedPos: {color, x, y}}
    groups: [], // Array<{color, pieces: Array<EncodedPos>, liberties: Number}>
  };
}


