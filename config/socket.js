import { Server } from "socket.io";
import { registerGameSocket } from "../sockets/game.socket.js";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        registerGameSocket(io, socket);
    });

    return io;
};