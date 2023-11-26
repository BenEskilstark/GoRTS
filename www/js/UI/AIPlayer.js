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

  // dispatches to the action to self and server if it's my turn,
  // else just queue's the action to myself
  // TODO: this is also defined in GameBoard
  dispatchOrQueue(action) {
    const {myTurn, realtime} = this.getState();
    if (!myTurn && realtime) {
      this.dispatch({type: 'QUEUE_ACTION', action});
    } else {
      this.dispatchToServerAndSelf(action);
    }
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
        this.dispatch({mana: mana - 1});
        this.dispatchOrQueue({type: 'PLACE_PIECE', x, y, color});
      }
      if (!realtime) {
        this.dispatchToServerAndSelf({type: 'END_TURN', clientID});
      } // else turn end is handled already

    }, 1000 / (this.getState().apm / 60));
  }
}
