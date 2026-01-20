import { useEffect } from "react";
import socket from "../services/socket";

const Lobby = ({ findGame, goToGame, lobbyInfo, userName }) => {
  useEffect(() => {
    
    socket.on("lobby:updated", (game) => {
        console.log("Lobby updated:", game);
    });

    socket.emit("joinLobby", { lobbyId: lobbyInfo.id, userName: userName });

    return () => {
      socket.off("lobby:updated");
    };
  }, []);

  return (
    <div>
        <h1>Lobby</h1>
        <p>Game ID: {lobbyInfo?.id}</p>
        <p>Game Name: {lobbyInfo?.name}</p>
        <p>Password: {lobbyInfo?.password}</p>

        <button onClick={findGame}>Back to Find Game</button>

        <h2>Players in Lobby</h2>
        <p>...</p>
    </div>
  );
}

export default Lobby;