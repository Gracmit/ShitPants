import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerDisconnectSocket } from '../sockets/disconnect.socket.js';
import { gameStore } from '../stores/game.stores.js';
import setup from '../game/setup.js';

vi.mock('../stores/game.stores.js');
vi.mock('../game/setup.js');

describe('Disconnect Socket Events', () => {
    let io, socket;

    beforeEach(() => {
        io = {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        };
        socket = {
            on: vi.fn(),
            leave: vi.fn(),
            id: 'socket123',
            userName: 'Player1'
        };
        gameStore.getWithPlayer.mockClear();
        gameStore.update.mockClear();
        gameStore.remove.mockClear();
        setup.removePlayerFromGame.mockClear();
        vi.clearAllMocks();
    });

    it('should register disconnect event listener', () => {
        registerDisconnectSocket(io, socket);

        expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('should do nothing if player has no active game', () => {
        gameStore.getWithPlayer.mockReturnValue(null);

        registerDisconnectSocket(io, socket);
        const disconnectCallback = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectCallback();

        expect(socket.leave).not.toHaveBeenCalled();
        expect(gameStore.update).not.toHaveBeenCalled();
    });

    it('should remove player and delete game if no players left', () => {
        const gameId = 'game123';
        const game = {
            id: gameId,
            players: [{ userName: 'Player1' }]
        };
        const updatedGame = { ...game, players: [] };

        gameStore.getWithPlayer.mockReturnValue(game);
        setup.removePlayerFromGame.mockReturnValue(updatedGame);

        registerDisconnectSocket(io, socket);
        const disconnectCallback = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectCallback();

        expect(socket.leave).toHaveBeenCalledWith(gameId);
        expect(setup.removePlayerFromGame).toHaveBeenCalledWith(game, 'Player1');
        expect(gameStore.remove).toHaveBeenCalledWith(gameId);
    });

    it('should notify remaining players when one disconnects', () => {
        const gameId = 'game123';
        const game = {
            id: gameId,
            players: [{ userName: 'Player1' }, { userName: 'Player2' }]
        };
        const updatedGame = {
            ...game,
            players: [{ userName: 'Player2' }]
        };

        gameStore.getWithPlayer.mockReturnValue(game);
        setup.removePlayerFromGame.mockReturnValue(updatedGame);

        registerDisconnectSocket(io, socket);
        const disconnectCallback = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectCallback();

        expect(socket.leave).toHaveBeenCalledWith(gameId);
        expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
        
        const systemMessageCall = io.emit.mock.calls.find(call => call[0] === 'chat:message');
        expect(systemMessageCall).toBeDefined();
        expect(systemMessageCall[1]).toEqual({
            userName: 'System',
            message: 'Player1 left the lobby.'
        });
    });

    it('should emit lobby:updated to remaining players', () => {
        const gameId = 'game123';
        const game = {
            id: gameId,
            players: [{ userName: 'Player1' }, { userName: 'Player2' }]
        };
        const updatedGame = {
            ...game,
            players: [{ userName: 'Player2' }]
        };

        gameStore.getWithPlayer.mockReturnValue(game);
        setup.removePlayerFromGame.mockReturnValue(updatedGame);

        registerDisconnectSocket(io, socket);
        const disconnectCallback = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectCallback();

        const lobbyUpdatedCall = io.emit.mock.calls.find(call => call[0] === 'lobby:updated');
        expect(lobbyUpdatedCall).toBeDefined();
        expect(lobbyUpdatedCall[1]).toEqual(updatedGame);
    });

    it('should handle player without userName gracefully', () => {
        const gameId = 'game123';
        const game = {
            id: gameId,
            players: [{ userName: 'SomePlayer' }]
        };
        const updatedGame = { ...game, players: [] };

        gameStore.getWithPlayer.mockReturnValue(game);
        setup.removePlayerFromGame.mockReturnValue(updatedGame);

        socket.userName = undefined;

        registerDisconnectSocket(io, socket);
        const disconnectCallback = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        
        expect(() => disconnectCallback()).not.toThrow();
    });
});
