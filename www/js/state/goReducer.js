
import {placePiece, dropPiece} from '../state/goOperations.js';
import {isLegalPlacement} from '../selectors/goSelectors.js';
import {msToTurns, newDuration} from '../selectors/durationSelectors.js';
import {config} from '../config.js';

export const goReducer = (state, action) => {
  switch (action.type) {
    case 'END_TURN': {

      // first recursively evaluate all actions in the queue
      if (action.clientID == state.clientID) {
        state.actionQueue = [];
      }
      action.actions.forEach(a => state = goReducer(state, a));

      // update falling pieces
      const nextFallingPieces = {};
      for (const ePos in state.fallingPieces) {
        const piece = state.fallingPieces[ePos];
        if (state.turn == piece.duration.endTurn) {
          placePiece(state, piece);
        } else {
          nextFallingPieces[ePos] = piece;
        }
      }
      state.fallingPieces = nextFallingPieces;

      // update mana regeneration
      for (const clientID in state.nextMana) {
        if (state.turn == state.nextMana[clientID].endTurn) {
          state.mana[clientID] = Math.min(state.mana[clientID] + 1, config.maxMana);
          state.nextMana[clientID] =
            newDuration(state, msToTurns(state, config.manaRegenRate));
        }
      }

      const justEndedMyTurn = state.myTurn; // TODO: not sure I want this
      const turnIndex = (state.turnIndex + 1) % state.players.length;
      return {
        ...state,
        turn: state.turn + 1,
        myTurn: state.players[turnIndex] == state.clientID,
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
      const {x, y, duration, clientID} = action;

      // race condition can make this fail
      // if (state.mana[clientID] <= 0) return state;
      if (!isLegalPlacement(state, action)) return state;
      state.mana[clientID] -= 1;

      dropPiece(state, {x, y, clientID, duration});
      return state;
    }

    // DEPRECATED
    // case 'PLACE_PIECE': {
    //   const {x, y, clientID} = action;
    //   if (state.mana[clientID] <= 0) return state;
    //   if (!isLegalPlacement(state, action)) return state;
    //   state.mana[clientID] -= 1;
    //
    //   placePiece(state, {x, y, clientID});
    //   return state;
    // }
  }
  return state;
}
