import { Server } from "socket.io";

export const setupSocket = (server) => {
    const io = new Server(server);

    io.on("connection", (socket) => {
        registerGameSocket(io, socket);
    });

    return io;
};