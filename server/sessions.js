

//////////////////////////////////////////////////////////////////////////
// Connect and Disconnect
const clientConnect = (state, socket) => {
  const {clientToSocket, clientToSession, allClients, sessions} = state;
  const clientID = state.nextClientID++;
  console.log(`client ${clientID} connected`);

  // update state on client connect
  clientToSocket[clientID] = socket;
  allClients.push(clientID);

  // tell client what ID it is and what sessions exist
  const numConnectedClients = allClients.length;
  socket.emit('action', {clientID, sessions, numConnectedClients});

  // tell other clients that a new client has joined
  emit(state, {numConnectedClients}, clientID);
  return clientID
}


const clientDisconnect = (state, clientID) => {
  console.log(`client ${clientID} disconnected`);
  const {clientToSession, clientToSocket, allClients} = state;

  // first leave any session you might be in
  const clientSessionID = clientToSession[clientID];
  if (clientSessionID) leaveSession(state, clientID, clientSessionID);

  // update state
  state.allClients = allClients.filter(id => id != clientID);
  delete clientToSocket[clientID];
  const numConnectedClients = allClients.length;

  // tell other clients that a client has disconnected
  emit(state, {numConnectedClients}, clientID);
}
//////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////
// create, join, start, leave sessions
const createSession = (state, clientID) => {
  const {sessions} = state;
  // create session state
  const sessionID = state.nextSessionID++;
  sessions[sessionID] = {
    id: sessionID, clients: [], started: false,
    name: "Game #" + sessionID,
  };

  // inform all clients
  emit(state, {sessions}, clientID, false /* all */, true /* self */);

  // join the session you just created
  joinSession(state, clientID, sessionID);
};


const joinSession = (state, clientID, sessionID) => {
  const {clientToSession, sessions, clientToSocket} = state;

  // if a client is already in a session, it must leave that one first
  if (clientToSession[clientID]) {
    leaveSession(state, clientID, clientToSession[clientID]);
  }

  // add client to session state
  clientToSession[clientID] = sessionID;
  sessions[sessionID].clients.push(clientID);

  // inform all clients
  emit(state, {sessions}, clientID, false /* all */, true /* self */);

  // inform self that you're in this session
  clientToSocket[clientID].emit("action", {sessionID});
};


const leaveSession = (state, clientID, sessionID) => {
  const {clientToSession, sessions} = state;

  // update session state
  delete clientToSession[clientID];
  const clientSession = sessions[sessionID];
  clientSession.clients = clientSession.clients
    .filter(id => id != clientID);

  // delete session if it's empty
  if (sessions[sessionID].clients.length == 0) {
    delete sessions[sessionID];
  }

  // inform all clients
  emit(state, {type: 'LEAVE_SESSION', clientID, sessionID, sessions}, clientID)
};


const startSession = (state, clientID, sessionID) => {
  const {sessions} = state;
  sessions[sessionID].started = true;

  // inform all clients
  emit(state, {sessions}, clientID, false /* all */, true /* self */);

  // inform all in session specifically:
  emit(state, {type: 'START_SESSION'}, clientID, true, true);
};
//////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////
// helper for emitting to connected clients
const emit = (state, action, clientID, sessionOnly, includeSelf) => {
  const {allClients, sessions, clientToSession, clientToSocket} = state;
  let clientsToSendTo = [...allClients];
  if (sessionOnly) {
    if (clientToSession[clientID] == null) return; // not actually in a session
    clientsToSendTo = [...sessions[clientToSession[clientID]].clients];
  }
  if (!includeSelf) clientsToSendTo = clientsToSendTo.filter(id => id != clientID)
  for (const id of clientsToSendTo) {
    if (!clientToSocket[id]) continue; // client must've just disconnected
    clientToSocket[id].emit('action', action);
  }
}
//////////////////////////////////////////////////////////////////////////

module.exports = {
  clientConnect,
  clientDisconnect,
  createSession,
  joinSession,
  startSession,
  leaveSession,
  emit,
}
