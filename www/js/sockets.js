
export const setupSocket = (dispatch) => {
  const socket = io("http://localhost:8000");
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
