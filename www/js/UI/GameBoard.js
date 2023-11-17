import {dispatchToServer} from '../sockets.js';

export default class GameBoard extends HTMLElement {
  token = null;

  connectedCallback() {
    this.registerState();
    this.style.display = "none";
    const width = parseInt(this.getAttribute("width"));
    const height = parseInt(this.getAttribute("height"));
    const color = this.getAttribute("color");
    this.dispatch({width, height, color, myTurn: color == "black"});
    this.token = this.subscribe(this.onChange.bind(this))
  }

  registerState() {
    const storeEvent = new CustomEvent('requestStore', {bubbles: true, detail: {}});
    this.dispatchEvent(storeEvent);
    Object.assign(this, storeEvent.detail);
  }

  disconnectedCallback() {
    unsubscribe(this.token);
  }

  onChange(state) {
    if (state.screen == "LOBBY") return;
    this.render(state);
  }

  render(state) {
    const {width, height} = state;

    const canvas = this.querySelector("canvas")
    if (!canvas) return;
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

    for (const piece of state.pieces) {
      const {x, y, color} = piece;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x * sqSize, y * sqSize, sqSize / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  canvasClick(ev) {
    const {width, height, color, myTurn, clientID, socket} = this.getState();
    if (!myTurn) return;

    const canvas = this.querySelector("canvas")
    if (!canvas) return;
    const sqSize = canvas.getBoundingClientRect().width / width;

    const x = Math.round(ev.offsetX / sqSize);
    const y = Math.round(ev.offsetY / sqSize);

    if (x == 0 || x == width || y == 0 || y == height) return;

    this.dispatch({type: 'PLACE_PIECE', x, y, color});
    dispatchToServer(socket, {type: 'PLACE_PIECE', x, y, color});
    this.dispatch({type: 'END_TURN', clientID});
    dispatchToServer(socket, {type: 'END_TURN', clientID});
  }
}


