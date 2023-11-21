
export const setupSocket = (dispatch) => {
  const socket = io(window.location.hostname);
  socket.on("action", dispatch);
  return socket;
}

export const dispatchToServer = (socket, action) => {
  try {
    socket.emit("dispatch", action);
  } catch (ex) {
    console.log(ex);
  }
}
