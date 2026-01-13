import http from "http";
import app from "./app.js";
import { setupSocket } from "./config/socket.js";
import { gameState } from "./game/gameState.js";
import { shuffleDeck, dealHands } from "./game/rules.js";

const server = http.createServer(app);
setupSocket(server);

const newGameState = shuffleDeck(gameState);
const finalGameState = dealHands(newGameState);
console.log(finalGameState.players[0].hand);
console.log(finalGameState.players[1].hand);
server.listen(3001, () => {
    console.log("Server running on port 3000");
});