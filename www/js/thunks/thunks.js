import {config} from '../config.js';
import {isLegalPlacement, msToTurns} from '../selectors/selectors.js';

export const dropPiece = ({getState, dispatch}, {x, y, color}) => {
  const state = getState();
  const {mana, clientID} = state;

  if (!isLegalPlacement(state, {x, y, color})) return;
  if (mana[clientID] <= 0) return;
  const turns = msToTurns(state, config.fallingTime);

  dispatch({type: 'QUEUE_ACTION', action: {type: 'DROP_PIECE', x, y, color, turns, clientID}});
}
