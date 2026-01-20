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

  const handleJoinLobby = (game) => {
    if(game.players.length >= game.maxPlayers) {
      alert("Game is full!");
      return;
    }

    if(game.password !== "") {
      const password = prompt("Enter game password:");
      if(password !== game.password) {
        alert("Incorrect password!");
        return;
      }
    }
    setLobbyInfo({id: game.id, name: game.name, password: game.password});
    joinLobby();
  }

  return (
    <div>
        <h2>Find Game</h2>
        <button onClick={mainMenu}>Back to Main Menu</button>
        <button onClick={createGame}>Create New Game</button>
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