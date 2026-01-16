import { Server } from "socket.io";
import { registerGameSocket } from "../sockets/game.socket.js";

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

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id)
        });
    });

    return io;
};