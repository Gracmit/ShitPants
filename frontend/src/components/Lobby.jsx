import { useEffect, useState } from "react";
import socket from "../services/socket";
import Chat from "./Chat";

const Lobby = ({ findGame, goToGame, lobbyInfo, userName }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    
    socket.on("lobby:updated", (game) => {
        console.log("Lobby updated:", game);
        setPlayers(game.players);
    });

    

    socket.emit("joinLobby", { lobbyId: lobbyInfo.id, userName: userName });

    return () => {
      socket.off("lobby:updated");
    };
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <div style={{ flex: 1 }}>
        <h1>Lobby</h1>
        <p>Game ID: {lobbyInfo?.id}</p>
        <p>Game Name: {lobbyInfo?.name}</p>
        <p>Password: {lobbyInfo?.password}</p>

        <button onClick={findGame}>Back to Find Game</button>

        <h2>Players in Lobby</h2>
        {players.map(player => <p key={player.id}>{player.id}</p>)}
      </div>

      <Chat lobbyId={lobbyInfo?.id} userName={userName} />
    </div>
  );
}

export default Lobby;