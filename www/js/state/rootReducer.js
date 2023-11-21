import {placePiece} from '../state/goOperations.js';
import {isLegalPlacement} from '../selectors/selectors.js';
import {config} from '../config.js';

export const rootReducer = (state, action) => {
  if (state === undefined) state = initState();

  switch (action.type) {
    case 'END_TURN': {
      const turnIndex = (state.turnIndex + 1) % state.players.length;
      return {
        ...state,
        turn: state.turn + 1,
        turnIndex,
        myTurn: state.players[turnIndex] == state.clientID,
      };
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
      return {...state, screen: 'GAME', ...initGameState(session.clients, state.clientID)};
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

const colors = [
  'black', 'white', 'steelblue', 'lightgreen', 'pink',
  'orange', 'red', 'purple', 'blue', 'gray',
];

export const initGameState = (players, clientID) => {
  return {
    players, // Array<ClientID>

    turnIndex: 0, // index of player whose turn it is
    turn: 0,

    myTurn: players.indexOf(clientID) == 0,
    color: colors[players.indexOf(clientID)],
    actionQueue: [], // Array<Action>

    width: config.boardSize,
    height: config.boardSize,

    pieces: {}, // {EncodedPos: {color, x, y}}
    groups: [], // Array<{color, pieces: Array<EncodedPos>, liberties: Number}>
  };
}


