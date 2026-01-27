import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerGameSocket } from '../sockets/game.socket.js';
import { gameStore } from '../stores/game.stores.js';
import { playcard } from '../game/rules.js';
import { createGameSocketMocks, getSocketCallback, getEmitCall } from './utils/testHelpers.js';

vi.mock('../stores/game.stores.js');
vi.mock('../game/rules.js');

describe('Game Socket Events', () => {
    let io, socket;

    beforeEach(() => {
        const mocks = createGameSocketMocks('socket123');
        io = mocks.io;
        socket = mocks.socket;
        gameStore.get.mockClear();
        gameStore.update.mockClear();
        playcard.mockClear();
        vi.clearAllMocks();
    });

    it('should register game:playCard event listener', () => {
        registerGameSocket(io, socket);

        expect(socket.on).toHaveBeenCalledWith('game:playCard', expect.any(Function));
    });

    it('should handle valid card play', () => {
        const gameId = 'game123';
        const playerId = 'player1';
        const cards = ['AS', 'KH'];
        const game = { id: gameId, players: [{ id: playerId }] };
        const updatedGame = { ...game, playDeck: ['AS', 'KH'] };

        gameStore.get.mockReturnValue(game);
        playcard.mockReturnValue(updatedGame);

        registerGameSocket(io, socket);
        const playCardCallback = getSocketCallback(socket, 'game:playCard');
        playCardCallback({ gameId, playerId, cards });

        expect(gameStore.get).toHaveBeenCalledWith(gameId);
        expect(playcard).toHaveBeenCalledWith(game, playerId, cards);
        expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
        expect(io.to).toHaveBeenCalledWith(gameId);
        expect(io.emit).toHaveBeenCalledWith('game:updated', updatedGame);
    });

    it('should emit error on invalid card play', () => {
        const gameId = 'game123';
        const playerId = 'player1';
        const cards = ['XX'];
        const game = { id: gameId, players: [{ id: playerId }] };

        gameStore.get.mockReturnValue(game);
        playcard.mockReturnValue(null);

        registerGameSocket(io, socket);
        const playCardCallback = getSocketCallback(socket, 'game:playCard');
        playCardCallback({ gameId, playerId, cards });

        expect(io.to).toHaveBeenCalledWith(socket.id);
        expect(io.emit).toHaveBeenCalledWith('game:error', { message: 'Invalid move' });
    });

    it('should not update game if playcard returns null', () => {
        const gameId = 'game123';
        const playerId = 'player1';
        const cards = ['AS'];
        const game = { id: gameId };

        gameStore.get.mockReturnValue(game);
        playcard.mockReturnValue(null);

        registerGameSocket(io, socket);
        const playCardCallback = getSocketCallback(socket, 'game:playCard');
        playCardCallback({ gameId, playerId, cards });

        expect(gameStore.update).not.toHaveBeenCalled();
    });

    it('should handle non-existent game gracefully', () => {
        const gameId = 'nonexistent';
        const playerId = 'player1';
        const cards = ['AS'];

        gameStore.get.mockReturnValue(null);

        registerGameSocket(io, socket);
        const playCardCallback = getSocketCallback(socket, 'game:playCard');
        playCardCallback({ gameId, playerId, cards });

        expect(playcard).not.toHaveBeenCalled();
        expect(gameStore.update).not.toHaveBeenCalled();
    });

    it('should handle multiple card plays', () => {
        const gameId = 'game123';
        const playerId = 'player1';
        const game = { id: gameId };
        const updatedGame1 = { ...game, playDeck: ['AS'] };
        const updatedGame2 = { ...game, playDeck: ['AS', 'KH'] };

        gameStore.get.mockReturnValue(game);
        playcard.mockReturnValueOnce(updatedGame1).mockReturnValueOnce(updatedGame2);

        registerGameSocket(io, socket);
        const playCardCallback = getSocketCallback(socket, 'game:playCard');

        playCardCallback({ gameId, playerId, cards: ['AS'] });
        playCardCallback({ gameId, playerId, cards: ['KH'] });

        expect(playcard).toHaveBeenCalledTimes(2);
        expect(gameStore.update).toHaveBeenCalledTimes(2);
    });

    it('should pass correct data to playcard function', () => {
        const gameId = 'game123';
        const playerId = 'player1';
        const cards = ['AS', 'QD', '10C'];
        const game = { id: gameId };
        const updatedGame = { ...game, playDeck: cards };

        gameStore.get.mockReturnValue(game);
        playcard.mockReturnValue(updatedGame);

        registerGameSocket(io, socket);
        const playCardCallback = getSocketCallback(socket, 'game:playCard');
        playCardCallback({ gameId, playerId, cards });

        expect(playcard).toHaveBeenCalledWith(game, playerId, cards);
    });
});
