import StatefulHTML from './StatefulHTML.js';
import {getFreePositions, msToTurns} from '../selectors/selectors.js';
import {oneOf, randomIn, normalIn, weightedOneOf} from '../utils/stochastic.js';
import {config} from '../config.js';

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
      const {
        color, clientID, socket, width, height, realtime, myTurn,
        mana,
      } = state;
      if (!realtime && !myTurn) return;

      const {x, y} = oneOf(getFreePositions(state));

      if (mana > 0) {
        const turns = msToTurns(state, config.fallingTime);
        this.dispatch({mana: mana - 1});
        this.dispatchOrQueue({type: 'DROP_PIECE', x, y, color, turns});
      }
      if (!realtime) {
        this.dispatchToServerAndSelf({type: 'END_TURN', clientID});
      } // else turn end is handled already

    }, 1000 / (this.getState().apm / 60));
  }
}
