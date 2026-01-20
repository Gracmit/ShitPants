import { gameStore } from "../stores/game.stores.js";
import { initializeGame, playcard } from "../game/rules.js";

export const registerGameSocket = (io, socket) => {
    
    socket.on("game:playCard", (data) => {
        const { gameId, playerId, cards } = data;
        const game = gameStore.get(gameId);
        if (game) {
            const updatedGame = playcard(game, playerId, cards);
            if (updatedGame) {
                gameStore.update(gameId, updatedGame);
                io.to(gameId).emit("game:updated", updatedGame);
            }
            else {
                io.to(socket.id).emit("game:error", { message: "Invalid move" });
            }
        }
    });
};