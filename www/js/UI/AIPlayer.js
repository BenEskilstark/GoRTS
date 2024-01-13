import StatefulHTML from './StatefulHTML.js';
import {
  getFreePositions, belongsToAnyGroup,
  numSameNeighbors,
} from '../selectors/goSelectors.js';
import {oneOf, randomIn, normalIn, weightedOneOf} from '../utils/stochastic.js';
import {config} from '../config.js';
import {dropPiece} from '../thunks/thunks.js';
import {encodePos, decodePos} from '../utils/positions.js';
import {createBot} from '../bots/bot.js';
import {botConfigs} from '../bots/bot_config.js';

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
    let botConfig = botConfigs[this.getAttribute("botConfig")];
    let bot = createBot({numRows: config.boardSize, numCols: config.boardSize, config: botConfig});

    this.playInterval = setInterval(() => {
      const state = this.getState();
      if (state.screen != "GAME" ) return;
      const {clientID, realtime, myTurn, pieces} = state;

      if (!realtime && !myTurn) return;

      // Generates weights for free positions.
      bot.playerId = clientID;
      bot.reset();
      for (const encodedPos in pieces) {
        const {x, y, clientID} = pieces[encodedPos];
        bot.doMove(x, y, clientID);
      }

      let freePositions = getFreePositions(state)
        .filter(pos => {
          const encode = encodePos(pos);
          for (const group of state.groups) {
            if (group.clientID != state.clientID) continue;
            let eye_count = 0;
            for (const ePos in group.eyes) {
              if (eye_count >= 2) break;
              if (encode == ePos) return false;
              eye_count++;
            }
          }
          const {x, y} = pos;
          if (bot.weights[x][y] <= 0) return false;
          return true;
        });

      if (freePositions.length <= 0) {
        return;
      }

      let weights = freePositions.map(pos => {
        const {x, y} = pos;
        return bot.weights[x][y];
      });

      const {x, y} = weightedOneOf(freePositions, weights);
      dropPiece(this, {x, y, clientID});

      if (!realtime) {
        this.dispatchToServerAndSelf({type: 'END_TURN', clientID});
      } // else turn end is handled already

    }, 1000 / (this.getState().apm / 60));
  }
}
