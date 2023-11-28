
import StatefulClient from './UI/StatefulClient.js';
import Lobby from './UI/Lobby.js';
import DebugInfo from './UI/DebugInfo.js';
import ManaInfo from './UI/ManaInfo.js';
import ScoreInfo from './UI/ScoreInfo.js';
import ScreenRouter from './UI/ScreenRouter.js';
import GameBoard from './UI/GameBoard.js';
import AIPlayer from './UI/AIPlayer.js';

customElements.define('stateful-client', StatefulClient);
customElements.define("game-lobby", Lobby);
customElements.define("debug-info", DebugInfo);
customElements.define("mana-info", ManaInfo);
customElements.define("score-info", ScoreInfo);
customElements.define("screen-router", ScreenRouter);
customElements.define("game-board", GameBoard);
customElements.define('ai-player', AIPlayer);
