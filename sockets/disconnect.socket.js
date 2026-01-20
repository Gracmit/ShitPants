import { gameStore } from "../stores/game.stores.js";
import setup from "../game/setup.js";

export const registerDisconnectSocket = (io, socket) => {
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        const game = gameStore.getWithPlayer(socket.userName);
        console.log("Found game on disconnect:", game);
        if (!game) return;
        
        socket.leave(game.id);
        const updatedGame = setup.removePlayerFromGame(game, socket.userName);
        if (updatedGame.players.length === 0) {
            gameStore.remove(game.id);
        } else {
            io.to(game.id).emit("chat:message", {
                userName: "System",
                message: `${socket.userName} left the lobby.`,
            });
            gameStore.update(game.id, updatedGame);
            io.to(game.id).emit("lobby:updated", updatedGame);
        }
    });
};
