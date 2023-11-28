import {initGameState} from '../state/gameState.js';

export const sessionReducer = (state, action) => {
  switch (action.type) {
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
  }
  return state;
}
