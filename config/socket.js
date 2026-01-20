import { Server } from "socket.io";
import { registerGameSocket } from "../sockets/game.socket.js";
import setup from "../game/setup.js";
import { gameStore } from "../stores/game.stores.js";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        //registerGameSocket(io, socket);
        console.log(`Socket connected: ${socket.id}`);

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
            leaveLobby(data);
        });

        const leaveLobby = (data) => {
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

        };

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
                        io.to(data.lobbyId).emit("game:starting", updatedGame);
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

        socket.on("chat:message", (data) => {
            io.to(data.lobbyId).emit("chat:message", {
                userName: data.userName,
                message: data.message,
            });
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id)
            const game = gameStore.getWithPlayer(socket.userName);
            console.log("Found game on disconnect:", game);
            if (!game) return;
            leaveLobby({ lobbyId: game.id, userName: socket.userName });
        });
    });

    return io;
};