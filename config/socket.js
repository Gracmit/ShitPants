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
        registerGameSocket(io, socket);
        console.log(`Socket connected: ${socket.id}`);

        socket.on("joinLobby", (data) => {
            socket.join(data.lobbyId);
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

        socket.on("chat:message", (data) => {
            io.to(data.lobbyId).emit("chat:message", {
                userName: data.userName,
                message: data.message,
            });
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id)
        });
    });

    return io;
};