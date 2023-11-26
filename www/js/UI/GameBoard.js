import StatefulHTML from './StatefulHTML.js';
import {encodePos} from '../utils/positions.js';
import {config} from '../config.js';
import {
  getPieceGroupIndex, getNumLiberties,
  isLegalPlacement, mouseToGrid,
} from '../selectors/selectors.js';

export default class GameBoard extends StatefulHTML {
  endTurnInterval = null;

  connectedCallback() {}

  onChange(state) {
    // handle action queue
    if (state.myTurn && state.actionQueue.length > 0) {
      this.dispatch({type: 'CLEAR_ACTION_QUEUE'});
      for (const action of state.actionQueue) {
        this.dispatchToServerAndSelf(action);
      }
    }

    // handling ending your turn
    if (this.endTurnInterval == null && state.myTurn && state.realtime) {
      this.endTurnInterval = setTimeout(() => {
        this.endTurnInterval = null;
        this.dispatchToServerAndSelf({type: 'END_TURN', clientID: state.clientID});
      }, config.turnTime); // TODO: subtract latency from turnTime?
    }

    this.render(state, this.querySelector("canvas"));
  }

  render(state, canvas) {
    if (!canvas) return;
    const {width, height} = state;

    const ctx = canvas.getContext("2d");
    const sqSize = canvas.width / width;

    ctx.fillStyle="tan";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid lines
    ctx.beginPath();
    for (let x = 1; x < width; x++) {
      ctx.strokeStyle = "black";
      ctx.moveTo(x * sqSize, sqSize);
      ctx.lineTo(x * sqSize, canvas.height - sqSize);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let y = 1; y < height; y++) {
      ctx.strokeStyle = "black";
      ctx.moveTo(sqSize, y * sqSize);
      ctx.lineTo(canvas.width - sqSize, y * sqSize);
    }
    ctx.stroke();

    // little grid helper circles
    const xDist = (width - 2) / 3;
    const yDist = (height - 2) / 3;
    for (let x = Math.round(xDist / 2) + 1; x < width; x += Math.round(xDist)) {
      for (let y = Math.round(yDist / 2) + 1; y < height; y += Math.round(yDist)) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x * sqSize, y * sqSize, sqSize / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const p in state.fallingPieces) {
      const {x, y, color, turns, startTurns} = state.fallingPieces[p];
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(x * sqSize, y * sqSize, sqSize / 2 - 3, 0, Math.PI * 2);
      ctx.stroke();

      const maxRadius = sqSize / 2 - 3;
      const radius = (startTurns - turns) / startTurns * maxRadius;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x * sqSize, y * sqSize, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const p in state.pieces) {
      const {x, y, color} = state.pieces[p];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x * sqSize, y * sqSize, sqSize / 2 - 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw debugging info on piece
      if (false) {
        const groupIndex = getPieceGroupIndex(state, state.pieces[p]);
        const numLiberties = getNumLiberties(state, state.groups[groupIndex]);
        ctx.font = "16px Arial"; // Adjust the size and font style as needed
        ctx.fillStyle = "red";   // Set the color of the text to red
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Calculate the position where the text should be placed
        const textX = x * sqSize;
        const textY = y * sqSize;
        // Draw text
        ctx.fillText(numLiberties.toString(), textX, textY);
      }
    }

    if (!state.myTurn && !state.realtime) {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  }

  // dispatches the action to self and server if it's my turn,
  // else just queues the action to myself
  dispatchOrQueue(action) {
    const {myTurn, realtime} = this.getState();
    if (!myTurn && realtime) {
      this.dispatch({type: 'QUEUE_ACTION', action});
    } else {
      this.dispatchToServerAndSelf(action);
    }
  }

  canvasClick(ev) {
    const state = this.getState();
    const {
      width, height, color, myTurn, clientID, socket, pieces,
      realtime, mana,
    } = state;

    const canvas = this.querySelector("canvas")
    if (!canvas) return;
    const sqSize = canvas.getBoundingClientRect().width / width;

    const x = Math.round(ev.offsetX / sqSize);
    const y = Math.round(ev.offsetY / sqSize);

    if (!isLegalPlacement(state, {x, y})) return;
    if (mana <= 0) return;

    this.dispatch({mana: mana - 1});
    this.dispatchOrQueue({type: 'DROP_PIECE', x, y, color});

    if (!realtime) {
      this.dispatchToServerAndSelf({type: 'END_TURN', clientID});
    } // else turn end is handled already
  }

  canvasMouseDown(ev) {
    this.dispatch({mouseDown: true});
  }

  canvasMouseUp(ev) {
    this.dispatch({mouseDown: false});
  }

  canvasMouseMove(ev) {
    const state = this.getState();
    const {mouseDown, width, height, color, pieces, mana} = state;

    if (!mouseDown) return;

    const {x, y} = mouseToGrid(state, ev, this.querySelector("canvas"));

    if (!isLegalPlacement(state, {x, y})) return;
    if (mana <= 0) return;

    this.dispatch({mana: mana - 1});
    this.dispatchOrQueue({type: 'DROP_PIECE', x, y, color});
  }
}


