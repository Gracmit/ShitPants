import { describe, test, expect } from 'vitest';
import { shuffleDeck, dealHands, playcard, drawACardIfNeeded, findFirstTurnPlayer, pickUpPlayDeck, pullFromDeck } from '../game/rules.js';
import { createEmptyGame, createPlayer, createGameWithPlayers } from './utils/testHelpers.js';

describe('shuffleDeck', () => {
  test('should shuffle the deck without changing its length or elements', () => {
    const mockGameState = {
      ...createEmptyGame('game1'),
      pullDeck: ['A', 'B', 'C', 'D', 'E']
    };

    const originalDeck = [...mockGameState.pullDeck];
    const result = shuffleDeck(mockGameState);

    expect(result.pullDeck).toHaveLength(originalDeck.length);

    expect(result.pullDeck.sort()).toEqual(originalDeck.sort());
  });

  test('should return the updated gameState with shuffled pullDeck', () => {
    const mockGameState = {
      ...createEmptyGame('game1'),
      pullDeck: ['A', 'B']
    };

    const result = shuffleDeck(mockGameState);
    expect(result).toHaveProperty('pullDeck');
    expect(result.pullDeck).toEqual(expect.any(Array));
    expect(result.pullDeck).toHaveLength(2);
  });

  test('should not modify the original gameState', () => {
    const mockGameState = {
      ...createEmptyGame('game1'),
      pullDeck: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      players: [createPlayer('p1'), createPlayer('p2')]
    };
    const originalGameState = mockGameState;
    shuffleDeck(mockGameState);
    expect(mockGameState).toEqual(originalGameState);
  });
});



describe('dealHands', () => {
  test('should deal 5 cards to 2 player from the pullDeck', () => {
    const mockGameState = createGameWithPlayers('game1', [
      createPlayer('p1'),
      createPlayer('p2')
    ]);
    mockGameState.pullDeck = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    const result = dealHands(mockGameState);

    expect(result.players[0].hand).toHaveLength(5);
    expect(result.players[1].hand).toHaveLength(5);
    expect(result.pullDeck).toHaveLength(0);
  });

  test('should deal 5 cards to 3 player from the pullDeck', () => {
    const mockGameState = createGameWithPlayers('game1', [
      createPlayer('p1'),
      createPlayer('p2'),
      createPlayer('p3')
    ]);
    mockGameState.pullDeck = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    
    const result = dealHands(mockGameState);

    expect(result.players[0].hand).toHaveLength(5);
    expect(result.players[1].hand).toHaveLength(5);
    expect(result.players[2].hand).toHaveLength(5);
    expect(result.pullDeck).toHaveLength(0);
  });

  test('should not modify the original gameState', () => {
    const mockGameState = createGameWithPlayers('game1', [
      createPlayer('p1'),
      createPlayer('p2')
    ]);
    mockGameState.pullDeck = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
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
        { id: 'p2', hand: ['2D', '4H'] }
      ],
      playDeck: ['2S'],
      pullDeck: [],
      currentPlayerId: 'p2'
    };

    const result = playcard(mockGameState, 'p2', ['2D']);

    expect(result.currentPlayerId).toBe('p1');
  });

  test('should not modify the original gameState', () => {
    const mockGameState = createGameWithPlayers('game1', [
      createPlayer('p1'),
      createPlayer('p2')
    ]);
    mockGameState.pullDeck = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
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
        { id: 'p1', hand: ['3S', '3D', '4C'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['3H'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['3S', '3D']);
    expect(result.players[0].hand).toEqual(['4C']);
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

  test('should not collapse playDeck when 2 is played', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S', '2S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['QD'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['2S']);
    expect(result.playDeck).toEqual(['QD', '2S']);
    expect(result.players[0].hand).toEqual(['3S', '4S']);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('should not collapse playDeck when 2H is played', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['4D', '2H'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['KD', '3C'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['2H']);
    expect(result.playDeck).toEqual(['KD', '3C', '2H']);
    expect(result.players[0].hand).toEqual(['4D']);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('should not collapse playDeck when 2D is played', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '2D'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['6H'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['2D']);
    expect(result.playDeck).toEqual(['6H', '2D']);
    expect(result.players[0].hand).toEqual(['3S']);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('should not collapse playDeck when 2C is played', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['4H', '2C'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['8S'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };
    const result = playcard(mockGameState, 'p1', ['2C']);
    expect(result.playDeck).toEqual(['8S', '2C']);
    expect(result.players[0].hand).toEqual(['4H']);
    expect(result.currentPlayerId).toBe('p2');
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

describe('pickUpPlayDeck', () => {
  test('should allow player to pick up playDeck on their turn', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['6D', '7H', '8C'],
      pullDeck: ['9S'],
      currentPlayerId: 'p1'
    };

    const result = pickUpPlayDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toEqual(['3S', '4S', '6D', '7H', '8C']);
    expect(result.playDeck).toEqual([]);
    expect(result.currentPlayerId).toBe('p2');
  });

  test('should not allow picking up playDeck on wrong turn', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['6D', '7H', '8C'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = pickUpPlayDeck(mockGameState, 'p2');

    expect(result).toBeUndefined();
  });

  test('should pass turn to next player after picking up playDeck', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S'] },
        { id: 'p2', hand: ['5S'] },
        { id: 'p3', hand: ['6S'] }
      ],
      playDeck: ['7D'],
      pullDeck: [],
      currentPlayerId: 'p2'
    };

    const result = pickUpPlayDeck(mockGameState, 'p2');

    expect(result.currentPlayerId).toBe('p3');
  });

  test('should pass turn to first player when last player picks up', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['6D', '7H'],
      pullDeck: [],
      currentPlayerId: 'p2'
    };

    const result = pickUpPlayDeck(mockGameState, 'p2');

    expect(result.currentPlayerId).toBe('p1');
  });

  test('should add all playDeck cards to player\'s hand', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S'] },
        { id: 'p2', hand: ['3S'] }
      ],
      playDeck: ['4D', '5H', '6C', '7S', '8D'],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = pickUpPlayDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toHaveLength(6);
    expect(result.players[0].hand).toEqual(['2S', '4D', '5H', '6C', '7S', '8D']);
  });

  test('should not modify the original gameState', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['6D', '7H', '8C'],
      pullDeck: ['9S'],
      currentPlayerId: 'p1'
    };

    const originalGameState = mockGameState;
    pickUpPlayDeck(mockGameState, 'p1');
    expect(mockGameState).toEqual(originalGameState);
  });

  test('should handle empty playDeck', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: [],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = pickUpPlayDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toEqual(['3S', '4S']);
    expect(result.playDeck).toEqual([]);
    expect(result.currentPlayerId).toBe('p2');
  });
});

describe('pullFromDeck', () => {
  test('should allow player to pull a card from deck on their turn', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S', '4H'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: ['6D'],
      pullDeck: ['7H', '8C', '9D'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toEqual(['3S', '4H', '9D']);
    expect(result.pullDeck).toEqual(['7H', '8C']);
    expect(result.playDeck).toEqual(['6D']);
  });

  test('should not allow pulling from deck on wrong turn', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: [],
      pullDeck: ['7H'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p2');

    expect(result).toBeUndefined();
  });

  test('should not pull from deck if pullDeck is empty', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['3S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: [],
      pullDeck: [],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result).toBeUndefined();
  });

  test('should not pull from deck if player hand already has 6 or more cards', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S', '3S', '4S', '5S', '6S', '8S', '9S'] },
        { id: 'p2', hand: ['7S'] }
      ],
      playDeck: [],
      pullDeck: ['8S'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result).toBeUndefined();
  });

  test('should not pull from deck if player hand has exactly 6 cards', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S', '3S', '4S', '5S', '6S', '8S'] },
        { id: 'p2', hand: ['7S'] }
      ],
      playDeck: [],
      pullDeck: ['8S', '9S'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result).toBeUndefined();
  });

  test('should pull the last card from pullDeck when only one card remains', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S', '3S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: [],
      pullDeck: ['9H'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toEqual(['2S', '3S', '9H']);
    expect(result.pullDeck).toEqual([]);
  });

  test('should not modify the original gameState', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S', '3S'] },
        { id: 'p2', hand: ['5S'] }
      ],
      playDeck: [],
      pullDeck: ['8S', '9S'],
      currentPlayerId: 'p1'
    };

    const originalGameState = mockGameState;
    pullFromDeck(mockGameState, 'p1');
    expect(mockGameState).toEqual(originalGameState);
  });

  test('should pull card correctly when player has 4 cards', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S', '3S', '4S', '5S'] },
        { id: 'p2', hand: ['6S'] }
      ],
      playDeck: [],
      pullDeck: ['7H', '8C'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toHaveLength(5);
    expect(result.players[0].hand).toEqual(['2S', '3S', '4S', '5S', '8C']);
    expect(result.pullDeck).toEqual(['7H']);
  });

  test('should pull card correctly when player has 1 card', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S'] },
        { id: 'p2', hand: ['6S'] }
      ],
      playDeck: [],
      pullDeck: ['3H', '4C', '5D'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result.players[0].hand).toEqual(['2S', '5D']);
    expect(result.pullDeck).toEqual(['3H', '4C']);
  });

  test('should not affect other players hands when pulling', () => {
    const mockGameState = {
      players: [
        { id: 'p1', hand: ['2S'] },
        { id: 'p2', hand: ['3S', '4S'] }
      ],
      playDeck: [],
      pullDeck: ['5H'],
      currentPlayerId: 'p1'
    };

    const result = pullFromDeck(mockGameState, 'p1');

    expect(result.players[1].hand).toEqual(['3S', '4S']);
  });
});
