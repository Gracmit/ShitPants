export const registerChatSocket = (io, socket) => {
    socket.on("chat:message", (data) => {
        io.to(data.lobbyId).emit("chat:message", {
            userName: data.userName,
            message: data.message,
        });
    });
};
