import StatefulHTML from './StatefulHTML.js';

const lobbyContent = `
  <h2>Realtime Go</h2>
  <div>
    <button onclick="this.closest('game-lobby').createGame()">
      Create New Game
    </button>
  </div>
  <div class="gameList">

  </div>
`;

const listedGame = (state, sessionID) => {
  const {sessions} = state;
  const session = sessions[sessionID];
  const joinAction = JSON.stringify({type: 'JOIN_SESSION', sessionID})
    .replaceAll('"', "'");
  const startAction = JSON.stringify({type: 'START_SESSION', sessionID})
    .replaceAll('"', "'");
  const amHost = state.sessionID == sessionID && session.clients[0] == state.clientID;
  return `
    <div class="gameInLobby">
      ${session.name} Players: ${session.clients.length} / 10
      <button
        style="display: ${state.sessionID ? 'none' : 'inline'}"
        onclick="this.closest('game-lobby').dispatchToServer(${joinAction})"
      >
        Join Game
      </button>
      <button
        style="display: ${amHost ? 'inline' : 'none'}"
        onclick="this.closest('game-lobby').dispatchToServer(${startAction})"
      >
        Start Game
      </button>
      <button
        style="display: ${amHost ? 'inline' : 'none'}"
        onclick="this.closest('game-lobby').addAIPlayer()"
      >
        Add AI Player
      </button>
    </div>
  `;
}

const createGameClient = ({useAI, apm}) => {
  const aiPlayer = `<ai-player apm=${apm}></ai-player>`;
  return `
    <stateful-client>
      ${useAI ? aiPlayer : ""}
      <game-board></game-board>
    </stateful-client>
  `;
}


export default class Lobby extends StatefulHTML {
  connectedCallback() {
    this.innerHTML = lobbyContent;
  }

  onChange(state) {
    if (state.screen != "LOBBY") {
      this.style.display = "none";
      return;
    }
    this.style.display = "flex";

    const games = [];
    for (const sessionID in state.sessions) {
      games.push(listedGame(state, sessionID));
    }
    const gameList = this.querySelector(".gameList");
    gameList.innerHTML = games.join("\n");
  }

  createGame() {
    this.dispatchToServer({type: "CREATE_SESSION"});
  }

  addAIPlayer() {
    // add the client
    const container = document.getElementById("container");
    container.insertAdjacentHTML(
      'beforeend',
      createGameClient({useAPI: true, apm: 100}),
    );

    // have that client join this client's game
  }

}


