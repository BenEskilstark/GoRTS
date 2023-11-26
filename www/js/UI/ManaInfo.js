import StatefulHTML from './StatefulHTML.js';

export default class ManaInfo extends StatefulHTML {

  onChange(state) {
    if (!state.myTurn) return;

    this.innerHTML = `Pieces remaining: ${state.mana}`;
  }

}


