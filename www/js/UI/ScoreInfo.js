import StatefulHTML from './StatefulHTML.js';
import {config} from '../config.js';

export default class ScoreInfo extends StatefulHTML {

  onChange(state) {
    if (!state.myTurn) return;

    let pieceStr = "";
    for (let i = 0; i < state.players.length; i++) {
      const clientID = state.players[i];
      const score = state.score[clientID];
      const lost = state.lost[clientID];
      let placed = 0;
      for (const ePos in state.pieces) {
        if (state.colors[state.pieces[ePos].color] == clientID) {
          placed++;
        }
      }
      const color = config.colors[i];

      let scoreStr = `${placed} - ${lost} = <b>${score}</b>`;
      pieceStr += `&nbsp; <span style="color:${color}">${scoreStr}</span>`;
    }


    this.innerHTML = `Scores: ${pieceStr}`;
  }

}


