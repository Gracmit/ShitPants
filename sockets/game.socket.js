import { gameStore } from "../stores/game.stores.js";
import { playcard, pickUpPlayDeck } from "../game/rules.js";
import setup from "../game/setup.js";

export const registerGameSocket = (io, socket) => {

    socket.on("game:playCard", (data) => {
        const { gameId, playerId, cards } = data;
        const game = gameStore.get(gameId);
        if (game) {
            const updatedGame = playcard(game, playerId, cards);
            if(updatedGame.winnerId){
                const winnerId = updatedGame.winnerId;
                const recreatedGame = setup.recreateGame(updatedGame);
                gameStore.update(gameId, recreatedGame);
                io.to(gameId).emit("game:ended", { recreatedGame, winnerId: winnerId } );
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
    socket.on("debug:win", (data) => {
        console.log( "Debug win event received with data:", data );
        const { gameId, playerId } = data;
        const game = gameStore.get(gameId);
        if (game) {
            const updatedGame = { ...game, winnerId: playerId, id: game.id };
            const recreatedGame = setup.recreateGame(updatedGame);
            gameStore.update(gameId, recreatedGame);
            io.to(gameId).emit("game:ended", { updatedGame: recreatedGame, winnerId: playerId } );
        }   
    });
};