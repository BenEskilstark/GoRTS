import {dispatchToServer} from '../sockets.js';

export default class Lobby extends HTMLElement {
  token = null;

  connectedCallback() {
    this.registerState();
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
    const games = [];
    for (const sessionID in state.sessions) {
      const session = state.sessions[sessionID];
      const joinAction = JSON.stringify({type: 'JOIN_SESSION', sessionID})
        .replaceAll('"', "'");
      games.push(`
        <div class="gameInLobby">
          ${session.name} Players: ${session.clients.length}
          <button
            style="display: ${state.sessionID ? 'none' : 'inline'}"
            onclick="this.closest('game-lobby').toServer(${joinAction})"
          >
            Join Game
          </button>
        </div>
      `);
    }
    const gameList = this.querySelector(".gameList");
    gameList.innerHTML = games.join("\n");
  }

  createGame() {
    this.toServer({type: "CREATE_SESSION"});
  }

  toServer(action) {
    dispatchToServer(this.getState().socket, action);
  }

}


