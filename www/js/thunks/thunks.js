import {config} from '../config.js';
import {isLegalPlacement} from '../selectors/goSelectors.js';
import {msToTurns, newDuration} from '../selectors/durationSelectors.js';

export const dropPiece = ({getState, dispatch}, {x, y, clientID}) => {
  const state = getState();
  const {mana} = state;

  if (!isLegalPlacement(state, {x, y, clientID})) return;
  if (mana[clientID] <= 0) return;
  const turns = msToTurns(state, config.fallingTime);
  const duration = newDuration(state, turns);

  dispatch({type: 'QUEUE_ACTION',
    action: {type: 'DROP_PIECE', x, y, duration, clientID},
  });
}
