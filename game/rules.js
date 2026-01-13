import { cardValidityObject } from "./cardValidityObject.js";

export const shuffleDeck = (gameState) => {
    let deck = gameState.pullDeck.slice();

    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }

    gameState = {...gameState, pullDeck: deck};
    return gameState;
};

export const dealHands = (gameState) => {
    let players = gameState.players.slice();
    let pullDeck = gameState.pullDeck.slice();

    players.forEach(player => {
        for (let i = 0; i < 5; i++) {
            player.hand[i] = pullDeck.pop();
        }
    });

    return {...gameState, players: players, pullDeck: pullDeck};
};

export const playcard = (gameState, playerId, card) => {
    if(!isPlayerTurn(gameState.currentPlayerId, playerId)) return
    
    if(!isTheCardValid(gameState.playDeck, card)) return
    
    let players = gameState.players.slice();
    let playDeck = gameState.playDeck.slice();
    let pullDeck = gameState.pullDeck.slice();

    let player = players.find(player => player.id === playerId);
    player.hand = player.hand.filter(cardInHand => cardInHand !== card);

    playDeck.push(card);

    drawACardIfNeeded(player, pullDeck);

    let nextPlayerId = getNextPlayerId(gameState, playerId);
    return {...gameState, players: players, playDeck: playDeck, currentPlayerId: nextPlayerId};
}

const isPlayerTurn = (currentPlayerId, playerId) => {
    return currentPlayerId === playerId;
}

const isTheCardValid = (playDeck, card) => {
    return cardValidityObject[card].includes(playDeck[playDeck.length - 1]) || playDeck.length === 0;
}

const getNextPlayerId = (gameState, playerId) => {
    let currentIndex = gameState.players.findIndex(player => player.id === playerId);
    let nextIndex = (currentIndex + 1) % gameState.players.length;
    return gameState.players[nextIndex].id;
}

export const drawACardIfNeeded = (player, pullDeck) => {
    if (pullDeck.length <= 0) return;

    if(player.hand.length > 5) return;

    player.hand.push(pullDeck.pop());
}