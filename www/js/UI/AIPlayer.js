import StatefulHTML from './StatefulHTML.js';
import {
  getFreePositions, belongsToAnyGroup,
  numSameNeighbors,
} from '../selectors/goSelectors.js';
import {oneOf, randomIn, normalIn, weightedOneOf} from '../utils/stochastic.js';
import {config} from '../config.js';
import {dropPiece} from '../thunks/thunks.js';
import {encodePos} from '../utils/positions.js';

/**
 * Use like:
 *
 * <ai-player apm=300></ai-player>
 *
 */
export default class AIPlayer extends StatefulHTML {

  connectedCallback() {
    const apm = parseInt(this.getAttribute("apm"));
    this.dispatch({isAI: true, apm});
    this.setupAI();
  }

  disconnectedCallback() {
    this.unsubscribe(this.token); // super
    clearInterval(this.playInterval);
  }

  setupAI() {
    this.playInterval = setInterval(() => {
      const state = this.getState();
      if (state.screen != "GAME" ) return;
      const {clientID, realtime, myTurn} = state;
      if (!realtime && !myTurn) return;

      let freePositions = getFreePositions(state)
        .filter(pos => {
          const encode = encodePos(pos);
          for (const group of state.groups) {
            if (group.clientID != state.clientID) continue;
            for (const ePos in group.eyes) {
              if (encode == ePos) return false;
            }
          }
          return true;
        });

      let weights = freePositions.map(pos => {
        const n = numSameNeighbors(state, {...pos, clientID});
        if (n == 1) return config.aiNeighborWeight;
        if (n == 2) return config.aiNeighborWeight / 5;
        // if (n == 3) return config.aiNeighborWeight / 2;
        // if (n > 0) return config.aiNeighborWeight;
        return 1;
      });
      if (freePositions.length <= 0) {
        return;
      }
      const {x, y} = weightedOneOf(freePositions, weights);
      dropPiece(this, {x, y, clientID});

      if (!realtime) {
        this.dispatchToServerAndSelf({type: 'END_TURN', clientID});
      } // else turn end is handled already

    }, 1000 / (this.getState().apm / 60));
  }
}
