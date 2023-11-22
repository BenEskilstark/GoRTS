import StatefulHTML from './StatefulHTML.js';


export default class DebugInfo extends StatefulHTML {
  connectedCallback() {
  }

  onChange(state) {
    if (state.screen != "GAME") {
      this.style.display = "none";
      return;
    }
    this.style.display = "inline-block";
    if (!state.myTurn) return;
    const msSinceLast = Date.now() - state.lastTurnEndTime;

    this.innerHTML = `Turns per second: ${(1000 / msSinceLast).toFixed(2)}`;
  }

}


