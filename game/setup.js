import { gameState } from "./gameState.js";

const createGame = (gameName, password, numPlayers, playerName) => {
    const player = {id: playerName, hand: [], isReady: false};
    const game = {...gameState, players: [player]};
    game.name = gameName;
    game.password = password;
    game.maxPlayers = numPlayers;
    return game;
}

const addPlayerToGame = (game, playerId) => {
    if (game.players.find(p => p.id === playerId)) {
        return game;
    }
    const newPlayer = {id: playerId, hand: [], isReady: false};
    const updatedPlayers = [...game.players, newPlayer];
    return {...game, players: updatedPlayers};
}

const removePlayerFromGame = (game, playerId) => {
    const updatedPlayers = game.players.filter(p => p.id !== playerId);
    return {...game, players: updatedPlayers};
}

const setPlayerReadyStatus = (game, playerId, isReady) => {
    const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
            return {...player, isReady};
        }
        return player;
    });
    return {...game, players: updatedPlayers};
}

export default { createGame, addPlayerToGame, removePlayerFromGame, setPlayerReadyStatus };