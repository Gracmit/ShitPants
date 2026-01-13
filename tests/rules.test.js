import { describe, test, expect } from 'vitest';
import { shuffleDeck, dealHands, playcard, drawACardIfNeeded, findFirstTurnPlayer } from '../game/rules.js';

describe('shuffleDeck', () => {
  test('should shuffle the deck without changing its length or elements', () => {
    const mockGameState = {
      pullDeck: ['A', 'B', 'C', 'D', 'E'],
      players: [],
      playDeck: [],
      currentPlayerId: 'p1'
    };

    const originalDeck = [...mockGameState.pullDeck];
    const result = shuffleDeck(mockGameState);

    expect(result.pullDeck).toHaveLength(originalDeck.length);

    expect(result.pullDeck.sort()).toEqual(originalDeck.sort());
  });

  test('should return the updated gameState with shuffled pullDeck', () => {
    const mockGameState = {
      pullDeck: ['A', 'B'],
      players: [],
      playDeck: [],
      currentPlayerId: 'p1'
    };

    const result = shuffleDeck(mockGameState);
    expect(result).toHaveProperty('pullDeck');
    expect(result.pullDeck).toEqual(expect.any(Array));
    expect(result.pullDeck).toHaveLength(2);
  });

  test('should not modify the original gameState', () => {
    const mockGameState = {
      pullDeck: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      players: [{ id: "p1", hand: [] },
      { id: "p2", hand: [] }],
      playDeck: [],
      currentPlayerId: 'p1'
    };
    const originalGameState = mockGameState;
    shuffleDeck(mockGameState);
    expect(mockGameState).toEqual(originalGameState);
  });
});



describe('dealHands', () => {
  test('should deal 5 cards to 2 player from the pullDeck', () => {
    const mockGameState = {
      pullDeck: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      players: [{ id: "p1", hand: [] },
      { id: "p2", hand: [] }],
      playDeck: [],
      currentPlayerId: 'p1'
    };
    const result = dealHands(mockGameState);

    expect(result.players[0].hand).toHaveLength(5);
    expect(result.players[1].hand).toHaveLength(5);
    expect(result.pullDeck).toHaveLength(0);
  });

  test('should deal 5 cards to 3 player from the pullDeck', () => {
    const mockGameState = {
      pullDeck: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
      players: [{ id: "p1", hand: [] },
      { id: "p2", hand: [] },
      { id: "p3", hand: [] }],
      playDeck: [],
      currentPlayerId: 'p1'
    };
    const result = dealHands(mockGameState);

    expect(result.players[0].hand).toHaveLength(5);
    expect(result.players[1].hand).toHaveLength(5);
    expect(result.players[2].hand).toHaveLength(5);
    expect(result.pullDeck).toHaveLength(0);
  });

  test('should not modify the original gameState', () => {
    const mockGameState = {
      pullDeck: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      players: [{ id: "p1", hand: [] },
      { id: "p2", hand: [] }],
      playDeck: [],
      currentPlayerId: 'p1'
    };
    const originalGameState = mockGameState;
    dealHands(mockGameState);
    expect(mockGameState).toEqual(originalGameState);
  });
});

describe('playcard', () => {
  test('should allow playing a valid card on player\'s turn', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2H', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['2S'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = playcard(mockGameState, 'p1', ['2H']);

    expect(result.players[0].hand).toEqual(['4S']);
    expect(result.playDeck).toEqual(['2S', '2H']);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('should not allow playing an invalid card', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['AS', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['2S'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = playcard(mockGameState, 'p1', ['AS']);

    expect(result).toBeUndefined();
  });

  test('should not allow playing on wrong turn', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['2S'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = playcard(mockGameState, 'p2', ['5S']);

    expect(result).toBeUndefined();
  });

  test('should allow playing the first card on empty playDeck', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: [],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = playcard(mockGameState, 'p1', ['3S']);

    expect(result.players[0].hand).toEqual(['4S']);
    expect(result.playDeck).toEqual(['3S']);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('should cycle to first player after last player', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S'] },
        { id: 'p2', hand: ['2D'] }
      ],
      playDeck: ['2S'],
      pullDeck: [],
      currentPlayerId: 'p2'
    };

    const result = playcard(mockGameState, 'p2', ['2D']);

    expect(result.currentPlayerId).toBe('p1');
  });

  test('should not modify the original gameState', () => {
    const mockGameState = {
      pullDeck: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      players: [{ id: "p1", hand: [] },
      { id: "p2", hand: [] }],
      playDeck: [],
      currentPlayerId: 'p1'
    };
    const originalGameState = mockGameState;
    playcard(mockGameState, 'p1', ['3S']);
    expect(mockGameState).toEqual(originalGameState);
  });

  test('should not allow playing cards of different values', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['2S'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['3S', '4S']);
    expect(result).toBeUndefined();
  });

  test('should allow playing multiple valid cards of the same value', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '3D'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['3H'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['3S', '3D']);
    expect(result.players[0].hand).toEqual([]);
    expect(result.playDeck).toEqual(['3H', '3S', '3D']);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('cannot play a card not in hand', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['3D'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['5S']);
    expect(result).toBeUndefined();
  });

  test('should collapse playDeck when A is played', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S', 'AS'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['QD'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['AS']);
    console.log(result);
    expect(result.playDeck).toEqual([]);
    expect(result.players[0].hand).toEqual(['3S', '4S']);
    expect(result.currentPlayerId).toBe('p1');
  });

  test('should collapse playDeck when 10 is played', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S', '10S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['5D'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['10S']);
    console.log(result);
    expect(result.playDeck).toEqual([]);
    expect(result.players[0].hand).toEqual(['3S', '4S']);
    expect(result.currentPlayerId).toBe('p1');
  });
});

describe('drawACardIfNeeded', () => {
  test('should not draw if pullDeck is empty', () => {
    const player = { id: 'p1', hand: ['A', 'B', 'C', 'D', 'E'] };
    const pullDeck = [];

    drawACardIfNeeded(player, pullDeck);

    expect(player.hand).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(pullDeck).toEqual([]);
  });

  test('should draw cards if player hand has 4 or fewer cards and pullDeck has cards, untill 5 cards at hand', () => {
    const player = { id: 'p1', hand: ['A', 'B', 'C'] };
    const pullDeck = ['D', 'F', 'G'];

    drawACardIfNeeded(player, pullDeck);

    expect(player.hand).toEqual(['A', 'B', 'C', 'G', 'F']);
    expect(pullDeck).toEqual(['D']);
  });

  test('should not draw a card if player hand has exactly 5 cards and pullDeck has cards', () => {
    const player = { id: 'p1', hand: ['A', 'B', 'C', 'D', 'E'] }; // 5 cards
    const pullDeck = ['F', 'G'];

    drawACardIfNeeded(player, pullDeck);

    expect(player.hand).toEqual(['A', 'B', 'C', 'D', 'E']); // G popped
    expect(pullDeck).toEqual(['F', 'G']);
  });

  test('should not draw a card if player hand has more than 5 cards', () => {
    const player = { id: 'p1', hand: ['A', 'B', 'C', 'D', 'E', 'F'] }; // 6 cards
    const pullDeck = ['G'];

    drawACardIfNeeded(player, pullDeck);

    expect(player.hand).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(pullDeck).toEqual(['G']);
  });
})

describe('findFirstTurnPlayer', () => {
  test('should return the id of the player with the lowest card', () => {
    const mockGameState = { 
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['2D', '5H'] }
      ],
      playDeck: [],
      pullDeck: [],
      currentPlayerId: null
    };
    const result = findFirstTurnPlayer(mockGameState);
    expect(result).toBe('p1');
  });
  test('should handle multiple players and return the correct player id', () => {
    const mockGameState = { 
      players: [
        { id: 'p1', hand: ['5S', '6S'] },
        { id: 'p2', hand: ['3D', '4H'] },
        { id: 'p3', hand: ['2C', '7D'] }
      ],
      playDeck: [],
      pullDeck: [],
      currentPlayerId: null
    };
    const result = findFirstTurnPlayer(mockGameState);
    expect(result).toBe('p2');
  });
});
