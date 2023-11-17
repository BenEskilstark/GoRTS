
import StatefulClient from './UI/StatefulClient.js';
import Lobby from './UI/Lobby.js';
import GameBoard from './UI/GameBoard.js';
import AIPlayer from './UI/AIPlayer.js';

customElements.define('stateful-client', StatefulClient);
customElements.define("game-lobby", Lobby);
customElements.define("game-board", GameBoard);
customElements.define('ai-player', AIPlayer);
