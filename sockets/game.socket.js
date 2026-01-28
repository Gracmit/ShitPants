import { gameStore } from "../stores/game.stores.js";
import { playcard, pickUpPlayDeck } from "../game/rules.js";

export const registerGameSocket = (io, socket) => {

    socket.on("game:playCard", (data) => {
        const { gameId, playerId, cards } = data;
        const game = gameStore.get(gameId);
        if (game) {
            const updatedGame = playcard(game, playerId, cards);
            if(updatedGame.winnerId){
                io.to(gameId).emit("game:ended", { updatedGame, winnerId: updatedGame.winnerId } );
            }

            if (updatedGame) {
                gameStore.update(gameId, updatedGame);
                io.to(gameId).emit("game:updated", updatedGame);
            }
            else {
                io.to(socket.id).emit("game:error", { message: "Invalid move" });
            }
        }
    });

    socket.on("game:pickUpPlayDeck", (data) => {
        const { gameId, playerId } = data;
        const game = gameStore.get(gameId);
        if (game) {
            const updatedGame = pickUpPlayDeck(game, playerId);
            if (updatedGame) {
                gameStore.update(gameId, updatedGame);
                io.to(gameId).emit("game:updated", updatedGame);
            }
            else {
                io.to(socket.id).emit("game:error", { message: "Cannot pickup play deck" });
            }
        }
    });
};