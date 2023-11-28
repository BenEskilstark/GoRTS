import StatefulHTML from './StatefulHTML.js';
import {config} from '../config.js';

export default class ManaInfo extends StatefulHTML {

  onChange(state) {
    if (!state.myTurn) return;

    let pieceStr = "";
    for (let i = 0; i < state.players.length; i++) {
      const clientID = state.players[i];
      const mana = state.mana[clientID];
      const color = config.colors[i];
      pieceStr += `&nbsp; <span style="color:${color}">${mana}</span>`;
    }


    this.innerHTML = `Pieces remaining: ${pieceStr}`;
  }

}


