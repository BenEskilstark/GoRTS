import StatefulHTML from './StatefulHTML.js';
import {getFreePositions} from '../selectors/selectors.js';
import {oneOf, randomIn, normalIn, weightedOneOf} from '../utils/stochastic.js';

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
      if (!state.myTurn) return;

      const {color, clientID, socket, width, height} = state;

      const {x, y} = oneOf(getFreePositions(state));

      this.dispatchToServerAndSelf({type: 'PLACE_PIECE', x, y, color});
      this.dispatchToServerAndSelf({type: 'END_TURN', clientID});

    }, 1000 / (this.getState().apm / 60));
  }
}
