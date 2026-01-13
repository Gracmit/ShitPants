import http from "http";
import app from "./app.js";
import { setupSocket } from "./config/socket.js";
import { gameState } from "./game/gameState.js";
import { shuffleDeck, dealHands } from "./game/rules.js";

const server = http.createServer(app);
setupSocket(server);

server.listen(3001, () => {
    console.log("Server running on port 3000");
});