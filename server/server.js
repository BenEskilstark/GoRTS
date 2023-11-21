const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const {
  clientConnect, clientDisconnect, emit,
  createSession, joinSession, startSession, leaveSession,
} = require('./sessions.js');
require('dotenv').config();

const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors())

// make all of www available
app.use(express.static(path.join(__dirname, '../www')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.HOSTNAME + ":" + port,
    // origin: "http://localhost:8000",
    methods: ["GET", "POST"],
  }
});

//////////////////////////////////
// Server State
const state = {
  allClients: [], // Array<ClientID>
  clientToSocket: {}, // ClientID -> Socket
  sessions: {}, // SessionID -> {id: SessionID, clients: Array<ClientID>, started: Bool}
  clientToSession: {}, // ClientID -> SessionID
  nextClientID: 1,
  nextSessionID: 1,
};
//////////////////////////////////

io.on("connection", (socket) => {
  const {sessions, clientToSocket, clientToSession} = state;

  const clientID = clientConnect(state, socket);

  // handle dispatches from clients
  socket.on("dispatch", (action) => {
    switch (action.type) {
      case 'CREATE_SESSION':
        return createSession(state, clientID);
      case 'JOIN_SESSION':
        return joinSession(state, clientID, action.sessionID);
      case 'START_SESSION':
        return startSession(state, clientID, action.sessionID);
      case 'LEAVE_SESSION':
        return leaveSession(state, clientID, action.sessionID);
    }
    // otherwise simply relay between clients
    emit(state, action, clientID, true /* session only */);
  });

  socket.on("disconnect", () => clientDisconnect(state, clientID));
});

server.listen(port);
