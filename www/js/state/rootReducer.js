
export const rootReducer = (state, action) => {
  if (state === undefined) state = initState();

  switch (action.type) {
    case 'END_TURN':
      return {...state, turn: state.turn + 1, myTurn: !state.myTurn};
    case 'PLACE_PIECE': {
      const {x, y, color} = action;
      state.pieces = [...state.pieces, {color, x, y}];
      return state;
    }
    case 'LEAVE_SESSION': {
      if (action.clientID == state.clientID) {
        state.sessionID = null;
      }
      state.sessions = action.sessions;
      return state;
    }
    case 'START_SESSION': { // your session is starting
      const session = state.sessions[state.sessionID];
      return {...state, screen: 'GAME', ...initGameState(session.clients)};
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
  };
}

export const initGameState = (players) => {
  return {
    players, // Array<ClientID>
    playerTurn: players[0], // whose turn is it
    turn: 0,
    color: 'black',
    pieces: [],
  };
}


