import StatefulHTML from './StatefulHTML.js';


export default class DebugInfo extends StatefulHTML {
  connectedCallback() {}

  onChange(state) {
    if (!state.myTurn) return;

    this.innerHTML = `Turn Rate: ${state.curTurnRate.toFixed(2)}`;
  }

}


