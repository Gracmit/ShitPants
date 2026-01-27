import { cardValidityObject, collapsingCards } from "./cardValidity.js";

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

export const playcard = (gameState, playerId, cards) => {
    if(!isPlayerTurn(gameState.currentPlayerId, playerId)) return

    if(!AreTheCardsValid(gameState.playDeck, cards)) return

    if(!cards.every(card => gameState.players.find(player => player.id === playerId).hand.includes(card))) return

    let players = gameState.players.slice();
    let playDeck = gameState.playDeck.slice();
    let pullDeck = gameState.pullDeck.slice();

    let player = players.find(player => player.id === playerId);
    player.hand = player.hand.filter(cardInHand => !cards.some(cardPlayed => cardPlayed === cardInHand));

    cards.forEach(card =>{
       playDeck.push(card);
    });

    drawACardIfNeeded(player, pullDeck);

    if(playingDeckCollapses(cards[0], playDeck)){
        return{...gameState, players: players, playDeck: [], pullDeck: pullDeck, currentPlayerId: playerId};
    }

    let nextPlayerId = getNextPlayerId(gameState, playerId);
    return {...gameState, players: players, playDeck: playDeck, pullDeck: pullDeck, currentPlayerId: nextPlayerId};
}

const isPlayerTurn = (currentPlayerId, playerId) => {
    return currentPlayerId === playerId;
}

const AreTheCardsValid = (playDeck, cards) => {
    const cardValue = cards[0][0];
    
    cards.forEach(card => {
        if(card[0] !== cardValue) return false;
    });

    if (playDeck.length === 0) return true;
    return cardValidityObject[playDeck[playDeck.length - 1]].includes(cards[0]) || playDeck.length === 0;
}


const getNextPlayerId = (gameState, playerId) => {
    let currentIndex = gameState.players.findIndex(player => player.id === playerId);
    let nextIndex = (currentIndex + 1) % gameState.players.length;
    return gameState.players[nextIndex].id;
}

export const pickUpPlayDeck = (gameState, playerId) => {
    if(!isPlayerTurn(gameState.currentPlayerId, playerId)) return

    let players = gameState.players.slice();
    let playDeck = gameState.playDeck.slice();
    let pullDeck = gameState.pullDeck.slice();

    let player = players.find(player => player.id === playerId);
    playDeck.forEach(card => {
        player.hand.push(card);
    });

    let nextPlayerId = getNextPlayerId(gameState, playerId);

    return {...gameState, players: players, playDeck: [], pullDeck: pullDeck, currentPlayerId: nextPlayerId};
}

export const drawACardIfNeeded = (player, pullDeck) => {
    if (pullDeck.length <= 0) return;

    if(player.hand.length > 5) return;

    for (let i = player.hand.length; i < 5; i++)
        if(pullDeck.length > 0){
            player.hand.push(pullDeck.pop());
        }
}

export const playingDeckCollapses = (cardPlayed, playDeck) => {
    if(collapsingCards.includes(cardPlayed)) return true;

    if(playDeck.length < 4) return false;

    const topCardValue = playDeck[playDeck.length -1].slice(0, -1);
    if(playDeck.slice(-4).every(card => card.slice(0, -1) === topCardValue)){
        return true;
    }
}

export const findFirstTurnPlayer = (gameState) => {
    let lowestCard = null;
    let firstPlayerId = null;

    gameState.players.forEach(player => {
        player.hand.forEach(card => {
            if (lowestCard === null || isCardLower(card, lowestCard)) {
                lowestCard = card;
                firstPlayerId = player.id;
            }
        });
    });

    return firstPlayerId;
}

const isCardLower = (cardA, cardB) => {
    const cardOrder = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
    const valueA = cardA.slice(0, -1);
    const valueB = cardB.slice(0, -1);
    return cardOrder.indexOf(valueA) < cardOrder.indexOf(valueB);
}

export const initializeGame = (gameState) => {
    let shuffledGameState = shuffleDeck(gameState);
    let dealtGameState = dealHands(shuffledGameState);
    let firstPlayerId = findFirstTurnPlayer(dealtGameState);
    return {...dealtGameState, currentPlayerId: firstPlayerId};
}