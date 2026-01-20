import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerGameSocket } from '../sockets/game.socket.js';
import { gameStore } from '../stores/game.stores.js';
import setup from '../game/setup.js';
import { initializeGame, playcard } from '../game/rules.js';

// Mock the modules
vi.mock('../stores/game.stores.js');
vi.mock('../game/setup.js');
vi.mock('../game/rules.js');

describe('Game Socket Events', () => {
    let io, socket;

    beforeEach(() => {
        io = {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        };
        socket = {
            join: vi.fn(),
            leave: vi.fn(),
            on: vi.fn()
        };
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

        const playCallback = socket.on.mock.calls.find(call => call[0] === 'game:playCard')[1];
        playCallback({ gameId, playerId, cards });

        expect(gameStore.get).toHaveBeenCalledWith(gameId);
        expect(playcard).toHaveBeenCalledWith(game, playerId, cards);
        expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
        expect(io.to).toHaveBeenCalledWith(gameId);
        expect(io.emit).toHaveBeenCalledWith('game:updated', updatedGame);
    });
});