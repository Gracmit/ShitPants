import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerLobbySocket } from '../sockets/lobby.socket.js';
import { gameStore } from '../stores/game.stores.js';
import setup from '../game/setup.js';

vi.mock('../stores/game.stores.js');
vi.mock('../game/setup.js');
vi.useFakeTimers();

describe('Lobby Socket Events', () => {
    let io, socket;

    beforeEach(() => {
        io = {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        };
        socket = {
            on: vi.fn(),
            join: vi.fn(),
            leave: vi.fn()
        };
        gameStore.get.mockClear();
        gameStore.update.mockClear();
        gameStore.remove.mockClear();
        setup.addPlayerToGame.mockClear();
        setup.removePlayerFromGame.mockClear();
        setup.setPlayerReadyStatus.mockClear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('should register joinLobby event listener', () => {
        registerLobbySocket(io, socket);

        expect(socket.on).toHaveBeenCalledWith('joinLobby', expect.any(Function));
    });

    it('should register leaveLobby event listener', () => {
        registerLobbySocket(io, socket);

        expect(socket.on).toHaveBeenCalledWith('leaveLobby', expect.any(Function));
    });

    it('should register player:readyStatus event listener', () => {
        registerLobbySocket(io, socket);

        expect(socket.on).toHaveBeenCalledWith('player:readyStatus', expect.any(Function));
    });

    describe('joinLobby', () => {
        it('should add player to lobby when joining', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [] };
            const updatedGame = { id: lobbyId, players: [{ userName }] };

            gameStore.get.mockReturnValue(game);
            setup.addPlayerToGame.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const joinCallback = socket.on.mock.calls.find(call => call[0] === 'joinLobby')[1];
            joinCallback({ lobbyId, userName });

            expect(socket.join).toHaveBeenCalledWith(lobbyId);
            expect(socket.userName).toBe(userName);
            expect(setup.addPlayerToGame).toHaveBeenCalledWith(game, userName);
            expect(gameStore.update).toHaveBeenCalledWith(lobbyId, updatedGame);
        });

        it('should emit lobby:updated event when player joins', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [] };
            const updatedGame = { id: lobbyId, players: [{ userName }] };

            gameStore.get.mockReturnValue(game);
            setup.addPlayerToGame.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const joinCallback = socket.on.mock.calls.find(call => call[0] === 'joinLobby')[1];
            joinCallback({ lobbyId, userName });

            const lobbyUpdatedCall = io.emit.mock.calls.find(call => call[0] === 'lobby:updated');
            expect(lobbyUpdatedCall).toBeDefined();
            expect(lobbyUpdatedCall[1]).toEqual(updatedGame);
        });

        it('should emit system message when player joins', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [] };
            const updatedGame = { id: lobbyId, players: [{ userName }] };

            gameStore.get.mockReturnValue(game);
            setup.addPlayerToGame.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const joinCallback = socket.on.mock.calls.find(call => call[0] === 'joinLobby')[1];
            joinCallback({ lobbyId, userName });

            const chatMessageCall = io.emit.mock.calls.find(call => call[0] === 'chat:message');
            expect(chatMessageCall).toBeDefined();
            expect(chatMessageCall[1]).toEqual({
                userName: 'System',
                message: 'Player1 joined the lobby.'
            });
        });
    });

    describe('leaveLobby', () => {
        it('should remove player from lobby', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [{ userName }] };
            const updatedGame = { id: lobbyId, players: [] };

            gameStore.get.mockReturnValue(game);
            setup.removePlayerFromGame.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const leaveCallback = socket.on.mock.calls.find(call => call[0] === 'leaveLobby')[1];
            leaveCallback({ lobbyId, userName });

            expect(socket.leave).toHaveBeenCalledWith(lobbyId);
            expect(setup.removePlayerFromGame).toHaveBeenCalledWith(game, userName);
        });

        it('should delete game if all players leave', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [{ userName }] };
            const updatedGame = { id: lobbyId, players: [] };

            gameStore.get.mockReturnValue(game);
            setup.removePlayerFromGame.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const leaveCallback = socket.on.mock.calls.find(call => call[0] === 'leaveLobby')[1];
            leaveCallback({ lobbyId, userName });

            expect(gameStore.remove).toHaveBeenCalledWith(lobbyId);
        });

        it('should notify remaining players when one leaves', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [{ userName }, { userName: 'Player2' }] };
            const updatedGame = { id: lobbyId, players: [{ userName: 'Player2' }] };

            gameStore.get.mockReturnValue(game);
            setup.removePlayerFromGame.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const leaveCallback = socket.on.mock.calls.find(call => call[0] === 'leaveLobby')[1];
            leaveCallback({ lobbyId, userName });

            const chatMessageCall = io.emit.mock.calls.find(call => call[0] === 'chat:message');
            expect(chatMessageCall).toBeDefined();
            expect(chatMessageCall[1]).toEqual({
                userName: 'System',
                message: 'Player1 left the lobby.'
            });
        });

        it('should not proceed if game does not exist', () => {
            const lobbyId = 'nonexistent';
            const userName = 'Player1';

            gameStore.get.mockReturnValue(null);

            registerLobbySocket(io, socket);
            const leaveCallback = socket.on.mock.calls.find(call => call[0] === 'leaveLobby')[1];
            leaveCallback({ lobbyId, userName });

            expect(setup.removePlayerFromGame).not.toHaveBeenCalled();
            expect(gameStore.update).not.toHaveBeenCalled();
        });
    });

    describe('player:readyStatus', () => {
        it('should update player ready status', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = { id: lobbyId, players: [{ userName, isReady: false }] };
            const updatedGame = { id: lobbyId, players: [{ userName, isReady: true }] };

            gameStore.get.mockReturnValue(game);
            setup.setPlayerReadyStatus.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const readyCallback = socket.on.mock.calls.find(call => call[0] === 'player:readyStatus')[1];
            readyCallback({ lobbyId, userName, isReady: true });

            expect(setup.setPlayerReadyStatus).toHaveBeenCalledWith(game, userName, true);
            expect(gameStore.update).toHaveBeenCalledWith(lobbyId, updatedGame);
        });

        it('should emit system message when player becomes ready', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = {
                id: lobbyId,
                players: [{ userName, isReady: false }]
            };
            const updatedGame = {
                id: lobbyId,
                players: [{ userName, isReady: true }]
            };

            gameStore.get.mockReturnValue(game);
            setup.setPlayerReadyStatus.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const readyCallback = socket.on.mock.calls.find(call => call[0] === 'player:readyStatus')[1];
            readyCallback({ lobbyId, userName, isReady: true });

            const chatMessageCall = io.emit.mock.calls.find(call => call[0] === 'chat:message');
            expect(chatMessageCall[1]).toEqual({
                userName: 'System',
                message: 'Player1 is now ready.'
            });
        });

        it('should emit system message when player becomes not ready', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = {
                id: lobbyId,
                players: [{ userName, isReady: true }]
            };
            const updatedGame = {
                id: lobbyId,
                players: [{ userName, isReady: false }]
            };

            gameStore.get.mockReturnValue(game);
            setup.setPlayerReadyStatus.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const readyCallback = socket.on.mock.calls.find(call => call[0] === 'player:readyStatus')[1];
            readyCallback({ lobbyId, userName, isReady: false });

            const chatMessageCall = io.emit.mock.calls.find(call => call[0] === 'chat:message');
            expect(chatMessageCall[1]).toEqual({
                userName: 'System',
                message: 'Player1 is now not ready.'
            });
        });

        it('should start game when all players are ready', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: false },
                    { userName: 'Player2', isReady: true }
                ]
            };
            const updatedGame = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: true },
                    { userName: 'Player2', isReady: true }
                ]
            };

            gameStore.get.mockReturnValue(game);
            setup.setPlayerReadyStatus.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const readyCallback = socket.on.mock.calls.find(call => call[0] === 'player:readyStatus')[1];
            readyCallback({ lobbyId, userName, isReady: true });

            const systemMessageCall = io.emit.mock.calls.find(call =>
                call[0] === 'chat:message' && call[1].message.includes('starting in 3 seconds')
            );
            expect(systemMessageCall).toBeDefined();
        });

        it('should emit game:starting when game is about to start', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: false },
                    { userName: 'Player2', isReady: true }
                ]
            };
            const updatedGame = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: true },
                    { userName: 'Player2', isReady: true }
                ]
            };

            gameStore.get.mockReturnValue(updatedGame);
            setup.setPlayerReadyStatus.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const readyCallback = socket.on.mock.calls.find(call => call[0] === 'player:readyStatus')[1];
            readyCallback({ lobbyId, userName, isReady: true });

            vi.runAllTimers();

            const gameStartingCall = io.emit.mock.calls.find(call => call[0] === 'game:starting');
            expect(gameStartingCall).toBeDefined();
            expect(gameStartingCall[1]).toEqual(updatedGame);
        });

        it('should cancel game start if not all players remain ready', () => {
            const lobbyId = 'lobby123';
            const userName = 'Player1';
            const game = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: false },
                    { userName: 'Player2', isReady: true }
                ]
            };
            const updatedGame = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: true },
                    { userName: 'Player2', isReady: true }
                ]
            };
            const gameAfterTimeout = {
                id: lobbyId,
                players: [
                    { userName: 'Player1', isReady: true },
                    { userName: 'Player2', isReady: false }
                ]
            };

            gameStore.get.mockReturnValueOnce(game).mockReturnValueOnce(gameAfterTimeout);
            setup.setPlayerReadyStatus.mockReturnValue(updatedGame);

            registerLobbySocket(io, socket);
            const readyCallback = socket.on.mock.calls.find(call => call[0] === 'player:readyStatus')[1];
            readyCallback({ lobbyId, userName, isReady: true });

            vi.runAllTimers();

            const cancelMessageCall = io.emit.mock.calls.find(call =>
                call[0] === 'chat:message' && call[1].message.includes('Not all players are ready')
            );
            expect(cancelMessageCall).toBeDefined();
        });
    });
});
