import { gameStore } from "../stores/game.stores.js";
import { initializeGame, playcard } from "../game/rules.js";
import setup from "../game/setup.js";

export const registerGameSocket = (io, socket) => {
    socket.on("game:join", (data) => {
        const { gameId, playerId } = data;
        socket.join(gameId);
        const game = gameStore.get(gameId);
        if (game && !game.players.find(p => p.id === playerId)) {
            const updatedGame = setup.addPlayerToGame(game, playerId);
            gameStore.update(gameId, updatedGame);
            io.to(gameId).emit("game:updated", updatedGame);
        }
    });

    socket.on("game:start", (gameId) => {
        const game = gameStore.get(gameId);
        if (game) {
            const initializedGame = initializeGame(game);
            gameStore.update(gameId, initializedGame);
            io.to(gameId).emit("game:started", initializedGame);
        }
    });

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

    socket.on("game:leave", (gameId) => {
        socket.leave(gameId);
    });
};