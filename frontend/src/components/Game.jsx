import { useEffect, useState } from 'react';
import socket from '../services/socket.js';
import './Game.css';
import Chat from './Chat.jsx';

const Game = ({ lobbyInfo, userName, goToMainMenu, goToLobby, setLobbyData }) => {
  const [gameState, setGameState] = useState(lobbyInfo);
  const [playerIndex, setPlayerIndex] = useState(gameState.players.findIndex(player => player.id === userName));
  const [selectedCards, setSelectedCards] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    console.log(gameState)
    socket.on("game:updated", (updatedGameState) => {
      console.log("Received game state update:", updatedGameState);
      setGameState(updatedGameState);
    });

    socket.on("game:error", (error) => {
      alert(error.message);
    });

    socket.on("game:ended", ({ updatedGame, winnerId }) => {
      console.log("Game ended. Winner:", winnerId);
      setGameState(updatedGame);
      setWinner(winnerId);
    });

    return () => {
      console.log("Cleaning up game socket listeners");
      socket.off("game:stateUpdate");
      socket.off("game:error");
      socket.off("game:ended");
    };
  }, []);

  const selectCard = (event) => {
    if (gameState.currentPlayerId !== userName) return;
    if (selectedCards.length > 0 && event.target.textContent[0] !== selectedCards[0][0]) {
      return;
    }
    console.log("Selecting/Deselecting card:", event.target.textContent);
    const card = event.target.textContent;

    let newSelectedCards = [...selectedCards];
    if (selectedCards.includes(card)) {
      newSelectedCards = selectedCards.filter(c => c !== card);
    } else {
      newSelectedCards = [...selectedCards, card];
    }

    setSelectedCards(newSelectedCards);
  };

  const playcards = async () => {
    if (selectedCards.length === 0) return;
    socket.emit("game:playCard", {
      gameId: gameState.id,
      playerId: userName,
      cards: selectedCards
    });
    setSelectedCards([]);
  };

  const pickUpPlayDeck = () => {
    socket.emit("game:pickUpPlayDeck", {
      gameId: gameState.id,
      playerId: userName
    });
  };

  const leaveGame = () => {
    goToMainMenu();
    socket.emit("leaveLobby", { lobbyId: lobbyInfo.id, userName: userName });
  }


  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {winner ? (
        <div className="WinnerAnnouncement">
          <h2>Game Over!</h2>
          <h3>Winner: {winner}</h3>
          <button onClick={leaveGame}>Return to Main Menu</button>
          <button onClick={() => goToLobby(gameState)}>Return to Lobby</button>
        </div>
      )
        :
        <div className="GameArea">
          <h3>{gameState.currentPlayerId}'s turn</h3>
          <div className='EnemyPlayersArea'>
            {gameState.players.filter((_, index) => index !== playerIndex).map((player, index) => (
              <div key={player.id} className="EnemyPlayerCard">
                <h3>{player.id}</h3>
                <p>Cards: {player.hand.length}</p>
              </div>
            ))}
          </div>

          <div className="PlayDeckArea">

            <h2>Play Deck</h2>
            {gameState.playDeck.length > 0 ? (
              <div className="PlayDeckCard">
                <h3>{gameState.playDeck[gameState.playDeck.length - 1]}</h3>
              </div>
            ) : (
              <p>Empty</p>
            )}
          </div>

          <div className="PlayerCardArea">
            {gameState.players[playerIndex].hand.map(card => (
              <div key={card}
                className={`PlayerCard${selectedCards.includes(card) ? "Active" : ""}`}
                onClick={selectCard}>
                <h3>{card}</h3>
              </div>
            ))}
          </div>
          <button className="PlayCardButton" onClick={playcards}>Play Selected Cards</button>
          <button className="PickUpPlayDeckButton" onClick={pickUpPlayDeck}>Pick Up Play Deck</button>
          <button onClick={() => {
            socket.emit("game:pullFromDeck", { gameId: gameState.id, playerId: userName })
          }}>
            Pull From Deck
          </button>
          <button onClick={() => {
            socket.emit("debug:win", { gameId: gameState.id, playerId: userName })
            console.log("Debug: Win Game")
          }}>
            Debug: Win Game
          </button>
        </div>
      }
      <Chat lobbyId={gameState.id} userName={userName}/>
    </div>
  );
}
export default Game;