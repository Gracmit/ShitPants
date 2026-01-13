import { gameState } from "./gameState.js";

export const createGame = (playerId) => {
    const player = {id: playerId, hand: []};
    const game = {...gameState, players: [player]};
    return game;
}

export const addPlayerToGame = (game, playerId) => {
    const newPlayer = {id: playerId, hand: []};
    const updatedPlayers = [...game.players, newPlayer];
    return {...game, players: updatedPlayers};
}

export default { createGame, addPlayerToGame };