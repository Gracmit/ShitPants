import React, { useEffect, useState } from 'react';
import socket from '../services/socket.js';
import './Game.css';
const Game = ({ lobbyInfo, userName }) => {
  const [gameState, setGameState] = useState(lobbyInfo);
  const [playerIndex, setPlayerIndex] = useState(gameState.players.findIndex(player => player.id === userName));
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    socket.on("game:updated", (updatedGameState) => {
      console.log("Received game state update:", updatedGameState);
      setGameState(updatedGameState);
    });

    socket.on("game:error", (error) => {
      alert(error.message);
    });
    return () => {
      socket.off("game:stateUpdate");
      socket.off("game:error");
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

  return (
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
    </div>
  );
}
export default Game;