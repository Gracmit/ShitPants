import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerGameSocket } from '../sockets/game.socket.js';
import { gameStore } from '../stores/game.stores.js';
import setup from '../game/setup.js';
import { initializeGame, playcard } from '../game/rules.js';
import { createGameSocketMocks, getSocketCallback } from './utils/testHelpers.js';

// Mock the modules
vi.mock('../stores/game.stores.js');
vi.mock('../game/setup.js');
vi.mock('../game/rules.js');

describe('Game Socket Events', () => {
    let io, socket;

    beforeEach(() => {
        const mocks = createGameSocketMocks('socket1');
        io = mocks.io;
        socket = mocks.socket;
        gameStore.get.mockClear();
        gameStore.update.mockClear();
        setup.addPlayerToGame.mockClear();
        initializeGame.mockClear();
        playcard.mockClear();
    });

    it('should handle game:playCard event', () => {
        const gameId = 'testGame';
        const playerId = 'player1';
        const cards = ['AS'];
        const game = { players: [{ id: playerId, hand: ['AS'] }] };
        const updatedGame = { ...game, playDeck: ['AS'] };
        gameStore.get.mockReturnValue(game);
        playcard.mockReturnValue(updatedGame);

        registerGameSocket(io, socket);

        const playCallback = getSocketCallback(socket, 'game:playCard');
        playCallback({ gameId, playerId, cards });

        expect(gameStore.get).toHaveBeenCalledWith(gameId);
        expect(playcard).toHaveBeenCalledWith(game, playerId, cards);
        expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
        expect(io.to).toHaveBeenCalledWith(gameId);
        expect(io.emit).toHaveBeenCalledWith('game:updated', updatedGame);
    });
});