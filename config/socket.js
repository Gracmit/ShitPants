import { Server } from "socket.io";
import { registerGameSocket } from "../sockets/game.socket.js";
import { registerLobbySocket } from "../sockets/lobby.socket.js";
import { registerChatSocket } from "../sockets/chat.socket.js";
import { registerDisconnectSocket } from "../sockets/disconnect.socket.js";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        
        registerGameSocket(io, socket);
        registerLobbySocket(io, socket);
        registerChatSocket(io, socket);
        registerDisconnectSocket(io, socket);
    });

    return io;
};