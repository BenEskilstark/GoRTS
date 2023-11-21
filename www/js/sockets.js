
export const setupSocket = (dispatch) => {
  let hostname = window.location.hostname;
  if (hostname == 'localhost') hostname += ':8000';
  const socket = io(hostname);
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
