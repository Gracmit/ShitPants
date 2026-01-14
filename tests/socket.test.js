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

    it('should handle game:join event', () => {
        const gameId = 'testGame';
        const playerId = 'player1';
        const game = { players: [] };
        const updatedGame = { ...game, players: [{ id: playerId }] };
        gameStore.get.mockReturnValue(game);
        setup.addPlayerToGame.mockReturnValue(updatedGame);

        registerGameSocket(io, socket);

        // Simulate the event
        const joinCallback = socket.on.mock.calls.find(call => call[0] === 'game:join')[1];
        joinCallback({ gameId, playerId });

        expect(socket.join).toHaveBeenCalledWith(gameId);
        expect(gameStore.get).toHaveBeenCalledWith(gameId);
        expect(setup.addPlayerToGame).toHaveBeenCalledWith(game, playerId);
        expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
        expect(io.to).toHaveBeenCalledWith(gameId);
        expect(io.emit).toHaveBeenCalledWith('game:updated', updatedGame);
    });

    it('should handle game:start event', () => {
        const gameId = 'testGame';
        const game = { players: [] };
        const initializedGame = { ...game, currentPlayerId: 'player1' };
        gameStore.get.mockReturnValue(game);
        initializeGame.mockReturnValue(initializedGame);

        registerGameSocket(io, socket);

        const startCallback = socket.on.mock.calls.find(call => call[0] === 'game:start')[1];
        startCallback(gameId);

        expect(gameStore.get).toHaveBeenCalledWith(gameId);
        expect(initializeGame).toHaveBeenCalledWith(game);
        expect(gameStore.update).toHaveBeenCalledWith(gameId, initializedGame);
        expect(io.to).toHaveBeenCalledWith(gameId);
        expect(io.emit).toHaveBeenCalledWith('game:started', initializedGame);
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

    it('should handle game:leave event', () => {
        const gameId = 'testGame';

        registerGameSocket(io, socket);

        const leaveCallback = socket.on.mock.calls.find(call => call[0] === 'game:leave')[1];
        leaveCallback(gameId);

        expect(socket.leave).toHaveBeenCalledWith(gameId);
    });
});