import {dispatchToServer} from '../sockets.js';

export default class AIPlayer extends HTMLElement {
  token = null;

  connectedCallback() {
    this.registerState();
    const apm = parseInt(this.getAttribute("apm"));
    this.dispatch({isAI: true, apm});
    this.setupAI();
  }

  registerState() {
    const storeEvent = new CustomEvent('requestStore', {bubbles: true, detail: {}});
    this.dispatchEvent(storeEvent);
    Object.assign(this, storeEvent.detail);
  }

  disconnectedCallback() {
    unsubscribe(this.token);
  }

  setupAI() {
    const playInterval = setInterval(() => {
      const state = this.getState();
      if (!state.myTurn) return;

      const {color, clientID, socket, width, height} = state;

      const x = Math.floor(Math.random() * (width - 1)) + 1;
      const y = Math.floor(Math.random() * (height - 1)) + 1;

      this.dispatch({type: 'PLACE_PIECE', x, y, color});
      dispatchToServer(socket, {type: 'PLACE_PIECE', x, y, color});
      this.dispatch({type: 'END_TURN', clientID});
      dispatchToServer(socket, {type: 'END_TURN', clientID});

    }, 1000 / (this.getState().apm / 60));
  }
}
