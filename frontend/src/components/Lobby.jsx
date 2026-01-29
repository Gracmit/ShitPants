import { useEffect, useState } from "react";
import socket from "../services/socket";
import Chat from "./Chat";

const Lobby = ({ findGame, goToGame, lobbyInfo, userName }) => {
  const [players, setPlayers] = useState([]);
  const [playerReadyStatus, setPlayerReadyStatus] = useState(false);

  useEffect(() => {
    socket.on("lobby:updated", (game) => setPlayers(game.players));
    socket.on("game:starting", (game) => goToGame(game));

    socket.emit("joinLobby", { lobbyId: lobbyInfo.id, userName });
    return () => socket.off("lobby:updated");
  }, []);

  const leaveLobby = () => {
    socket.emit("leaveLobby", { lobbyId: lobbyInfo.id, userName });
    findGame();
  };

  const setReadyStatus = (isReady) => {
    setPlayerReadyStatus(isReady);
    socket.emit("player:readyStatus", { lobbyId: lobbyInfo.id, userName, isReady });
  };

  return (
    <div className="layout">
      <div className="panel card">
        <h1>Lobby</h1>
        <p>Game ID: {lobbyInfo?.id}</p>
        <p>Game Name: {lobbyInfo?.name}</p>
        <p>Password: {lobbyInfo?.password}</p>

        {!playerReadyStatus && <button className="btn primary" onClick={() => setReadyStatus(true)}>Ready</button>}
        {playerReadyStatus && <button className="btn" onClick={() => setReadyStatus(false)}>Unready</button>}

        <button className="btn ghost" onClick={leaveLobby}>Back to Find Game</button>

        <h2>Players in Lobby</h2>
        {players.map(player => (
          <p key={player.id}>{player.id} {player.isReady ? "Ready" : "Not Ready"}</p>
        ))}
      </div>

      <Chat lobbyId={lobbyInfo?.id} userName={userName} />
    </div>
  );
}

export default Lobby;