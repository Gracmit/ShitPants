import { describe, test, expect } from 'vitest';
import { shuffleDeck, dealHands } from '../game/rules.js';

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