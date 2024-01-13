import StatefulHTML from './StatefulHTML.js';
import {config} from '../config.js';
import {botConfigs} from '../bots/bot_config.js';
import {dropdown} from '../UI/components/Dropdown.js';

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
      ${session.name} Players: ${session.clients.length} / 10 ${session.started ? "In Progress" : ""}
      <button
        style="display: ${state.sessionID || session.started ? 'none' : 'inline'}"
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
      ${dropdown({id: "botConfig",
        options: Object.keys(botConfigs),
        selected: document.getElementById('botConfig')?.value,
      })}
    </div>
  `;
}

const createAIClient = ({apm, sessionID, botConfig}) => {
  return `
    <stateful-client sessionID="${sessionID}">
      <ai-player apm=${apm} botConfig=${botConfig}></ai-player>
      <game-board></game-board>
    </stateful-client>
  `;
}


export default class Lobby extends StatefulHTML {
  connectedCallback() {}

  onChange(state) {
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
    const container = document.getElementById("container");
    const {sessionID} = this.getState();
    const botConfig = document.getElementById('botConfig').value;

    // add the client and have it join this one's game
    container.insertAdjacentHTML(
      'beforeend',
      createAIClient({apm: config.apm, sessionID, botConfig}),
    );

  }

}


