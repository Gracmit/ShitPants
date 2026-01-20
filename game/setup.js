import { gameState } from "./gameState.js";

export const createGame = (gameName, password, numPlayers, playerName) => {
    const player = {id: playerName, hand: []};
    const game = {...gameState, players: [player]};
    game.name = gameName;
    game.password = password;
    game.maxPlayers = numPlayers;
    return game;
}

export const addPlayerToGame = (game, playerId) => {
    console.log(`Adding player ${playerId} to game ${game.id}`);
    if (game.players.find(p => p.id === playerId)) {
        return game;
    }
    const newPlayer = {id: playerId, hand: []};
    const updatedPlayers = [...game.players, newPlayer];
    return {...game, players: updatedPlayers};
}

export default { createGame, addPlayerToGame };