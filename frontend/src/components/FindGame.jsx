import {useEffect, useState} from "react";
import gameService from '../services/game.js';

const FindGame = ({ joinLobby, mainMenu, createGame, setLobbyInfo }) => {

  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => {
    gameService.getGames().then(games => {
      console.log(games);
      setAvailableGames(games);
    }); 
  }, []);

  const handleJoinLobby = async (game) => {
    try {
      const gameStatus = await gameService.getGameStatus(game.id);
      if (gameStatus.players.length >= gameStatus.maxPlayers) {
        alert("Game is full!");
        return;
      }

      if (game.password !== "") {
        const password = prompt("Enter game password:");
        if (password !== game.password) {
          alert("Incorrect password!");
          return;
        }
      }
      setLobbyInfo({ id: game.id, name: game.name, password: game.password });
      joinLobby();
    } catch (error) {
      alert("Game not found!");
      gameService.getGames().then(games => {
        setAvailableGames(games);
      });
    }
  }

  const updateList = async () => {
    const games = await gameService.getGames();
    setAvailableGames(games);
  }

  return (
    <div>
        <h2>Find Game</h2>
        <button onClick={mainMenu}>Back to Main Menu</button>
        <button onClick={createGame}>Create New Game</button>
        <button onClick={updateList}>Refresh Game List</button>
        <ul>
          {availableGames.map((game) => (
            <li key={game.id}>
              
              {game.name} - Players: {game.players.length}/{game.maxPlayers}
              <button onClick={() => handleJoinLobby(game)}>Join {game.password !== "" && <span>🔒</span>}</button>
            </li>
          ))}
        </ul>
    </div>
  );
}

export default FindGame;