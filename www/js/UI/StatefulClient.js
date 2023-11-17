import {useReducer} from '../state/store.js';
import {rootReducer, initState} from '../state/rootReducer.js';
import {setupSocket} from '../sockets.js';

export default class StatefulClient extends HTMLElement {
  constructor() {
    super();
    const [getState, dispatch, subscribe, unsubscribe] = useReducer(rootReducer, initState());
    // subscribe(console.log);
    this.getState = getState;
    this.dispatch = dispatch;
    this.subscribe = subscribe;
    this.unsubscribe = unsubscribe;
  }

  connectedCallback() {
    this.provideStore(); // Provide the state methods to child components

    // setup websocket:
    const socket = setupSocket(this.dispatch);
    this.dispatch({socket});
  }

  provideStore() {
    this.addEventListener('requestStore', (ev) => {
      // Prevent this custom event from bubbling further
      ev.stopPropagation();
      // Set detail property with the state and dispatch functions
      ev.detail.getState = this.getState;
      ev.detail.dispatch = this.dispatch;
      ev.detail.subscribe = this.subscribe;
      ev.detail.unsubscribe = this.unsubscribe;
    }, true);
  }
}

