import StatefulHTML from './StatefulHTML.js';
import {encodePos} from '../utils/positions.js';
import {getPieceGroupIndex, getNumLiberties} from '../selectors/selectors.js';

export default class GameBoard extends StatefulHTML {
  connectedCallback() {
    const width = parseInt(this.getAttribute("width"));
    const height = parseInt(this.getAttribute("height"));
    const color = this.getAttribute("color");
    this.dispatch({width, height, color, myTurn: color == "black"});
  }

  onChange(state) {
    if (state.screen != "GAME") {
      this.style.display = "none";
      return;
    }
    this.style.display = "flex";

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

    if (!state.myTurn) {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  }

  canvasClick(ev) {
    const {width, height, color, myTurn, clientID, socket, pieces} = this.getState();
    if (!myTurn) return;

    const canvas = this.querySelector("canvas")
    if (!canvas) return;
    const sqSize = canvas.getBoundingClientRect().width / width;

    const x = Math.round(ev.offsetX / sqSize);
    const y = Math.round(ev.offsetY / sqSize);

    if (x == 0 || x == width || y == 0 || y == height) return; // outside the border
    if (pieces[encodePos({x, y})]) return; // already occupied

    this.dispatchToServerAndSelf({type: 'PLACE_PIECE', x, y, color});
    this.dispatchToServerAndSelf({type: 'END_TURN', clientID});
  }
}


