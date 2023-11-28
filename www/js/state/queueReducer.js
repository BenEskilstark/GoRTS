
export const queueReducer = (state, action) => {
  switch (action.type) {
    case 'QUEUE_ACTION': {
      state.actionQueue.push(action.action);
      return state;
    }
    case 'CLEAR_ACTION_QUEUE':
      return {...state, actionQueue: []};
  }
  return state;
}
