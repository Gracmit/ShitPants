import {useEffect, useState} from "react";
import gameService from '../services/game.js';

const FindGame = ({ joinLobby, mainMenu, createGame, setLobbyInfo }) => {

  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => { gameService.getGames().then(games => setAvailableGames(games)); }, []);

  const handleJoinLobby = async (game) => {
    try {
      const gameStatus = await gameService.getGameStatus(game.id);
      if (gameStatus.players.length >= gameStatus.maxPlayers) return alert("Game is full!");

      if (game.password !== "") {
        const password = prompt("Enter game password:");
        if (password !== game.password) return alert("Incorrect password!");
      }
      setLobbyInfo({ id: game.id, name: game.name, password: game.password });
      joinLobby();
    } catch (error) {
      alert("Game not found!");
      gameService.getGames().then(games => setAvailableGames(games));
    }
  }

  const updateList = async () => { const games = await gameService.getGames(); setAvailableGames(games); }

  return (
    <div className="panel">
      <div className="card">
        <h2>Find Game</h2>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <button className="btn" onClick={mainMenu}>Back to Main Menu</button>
          <button className="btn" onClick={createGame}>Create New Game</button>
          <button className="btn" onClick={updateList}>Refresh Game List</button>
        </div>

        <ul className="list">
          {availableGames.map((game) => (
            <li key={game.id}>
              <div>
                <strong>{game.name}</strong>
                <div style={{fontSize:12,color:'var(--muted)'}}>Players: {game.players.length}/{game.maxPlayers}</div>
              </div>
              <div>
                <button className="btn primary" onClick={() => handleJoinLobby(game)}>Join {game.password !== "" && <span>🔒</span>}</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FindGame;