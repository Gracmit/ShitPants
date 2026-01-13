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

