import {placePiece} from '../state/goOperations.js';
import {isLegalPlacement} from '../selectors/selectors.js';

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
    realtime: true,
  };
}

const colors = ['black', 'white', 'steelblue', 'lightgreen'];

export const initGameState = (players, clientID) => {
  return {
    players, // Array<ClientID>
    turnIndex: 0, // index of player whose turn it is
    turn: 0,
    actionQueue: [], // Array<Action>
    color: colors[players.indexOf(clientID)],
    pieces: {}, // {EncodedPos: {color, x, y}}
    groups: [], // Array<{color, pieces: Array<EncodedPos>, liberties: Number}>
  };
}


