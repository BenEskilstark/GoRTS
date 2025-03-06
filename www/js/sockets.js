
import {config} from "./config.js";

export const setupSocket = (dispatch) => {
  const socket = io(config.URL, {path: config.path});
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
