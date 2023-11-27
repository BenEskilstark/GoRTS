import StatefulHTML from './StatefulHTML.js';


export default class DebugInfo extends StatefulHTML {
  connectedCallback() {}

  onChange(state) {
    if (!state.myTurn) return;

    const instTR = state.curTurnRate.toFixed(2);
    const avgTR = state.avgTurnRate.toFixed(2);
    this.innerHTML = `Instantaneous Turn Rate: ${instTR}, Average TR: ${avgTR}`;
  }

}


