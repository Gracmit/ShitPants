import { gameStore } from "../stores/game.stores.js";
import setup from "../game/setup.js";
import { initializeGame } from "../game/rules.js";

export const registerLobbySocket = (io, socket) => {
    socket.on("joinLobby", (data) => {
        socket.join(data.lobbyId);
        socket.userName = data.userName;
        const game = gameStore.get(data.lobbyId);
        const updatedGame = setup.addPlayerToGame(game, data.userName);
        gameStore.update(data.lobbyId, updatedGame);
        io.to(data.lobbyId).emit("lobby:updated", updatedGame);
        io.to(data.lobbyId).emit("chat:message", {
            userName: "System",
            message: `${data.userName} joined the lobby.`,
        });
    });

    socket.on("leaveLobby", (data) => {
        socket.leave(data.lobbyId);
        const game = gameStore.get(data.lobbyId);
        if (!game) return;
        const updatedGame = setup.removePlayerFromGame(game, data.userName);
        if (updatedGame.players.length === 0) {
            gameStore.remove(data.lobbyId);
        } else {
            io.to(data.lobbyId).emit("chat:message", {
                userName: "System",
                message: `${data.userName} left the lobby.`,
            });
            gameStore.update(data.lobbyId, updatedGame);
            io.to(data.lobbyId).emit("lobby:updated", updatedGame);
        }
    });

    socket.on("player:readyStatus", (data) => {
        const game = gameStore.get(data.lobbyId);
        const updatedGame = setup.setPlayerReadyStatus(game, data.userName, data.isReady);
        gameStore.update(data.lobbyId, updatedGame);

        if(updatedGame.players.length >= 2 && updatedGame.players.every(p => p.isReady)) {
            io.to(data.lobbyId).emit("lobby:updated", updatedGame);
            io.to(data.lobbyId).emit("chat:message", {
                userName: "System",
                message: "All players are ready! Game is starting in 3 seconds...",
            });
            setTimeout(() => {
                if(gameStore.get(data.lobbyId).players.every(p => p.isReady)) {
                    const initializedGame = initializeGame(updatedGame);
                    gameStore.update(data.lobbyId, initializedGame);
                    io.to(data.lobbyId).emit("game:starting", initializedGame);
                    return;
                }
                io.to(data.lobbyId).emit("chat:message", {
                    userName: "System",
                    message: "Not all players are ready. Game start cancelled.",
                });

            }, 3000);
            return;
        }

        io.to(data.lobbyId).emit("lobby:updated", updatedGame);
        io.to(data.lobbyId).emit("chat:message", {
            userName: "System",
            message: `${data.userName} is now ${data.isReady ? "ready" : "not ready"}.`,
        });
    });
};
