import { describe, it, expect, vi, beforeEach } from 'vitest';
import gameRouter from '../controllers/gameController.js';
import { gameStore } from '../stores/game.stores.js';
import setup from '../game/setup.js';

// Mock the modules
vi.mock('../stores/game.stores.js');
vi.mock('../game/setup.js');

describe('Game Endpoints', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            statusCode: 200
        };
        gameStore.create.mockClear();
        gameStore.get.mockClear();
        gameStore.update.mockClear();
        gameStore.getAll.mockClear();
        setup.createGame.mockClear();
        setup.addPlayerToGame.mockClear();
    });

    describe('POST /create', () => {
        it('should create a new game successfully', () => {
            const gameName = 'Test Game';
            const password = 'password123';
            const numPlayers = 4;
            const playerName = 'Player1';
            const newGame = { id: 1, gameName, password, numPlayers, players: [{ name: playerName }] };

            req.body = { gameName, password, numPlayers, playerName };
            setup.createGame.mockReturnValue(newGame);
            gameStore.create.mockReturnValue(newGame);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/create');
            const handler = route.route.methods.post ? route.route.stack[0].handle : null;

            expect(handler).toBeDefined();
            handler(req, res);

            expect(setup.createGame).toHaveBeenCalledWith(gameName, password, numPlayers, playerName);
            expect(gameStore.create).toHaveBeenCalledWith(newGame);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newGame);
        });

        it('should handle missing game name', () => {
            req.body = { password: 'pass', numPlayers: 4, playerName: 'Player1' };
            const newGame = { id: 1 };

            setup.createGame.mockReturnValue(newGame);
            gameStore.create.mockReturnValue(newGame);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/create');
            const handler = route.route.methods.post ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(setup.createGame).toHaveBeenCalledWith(undefined, 'pass', 4, 'Player1');
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('GET /status/:id', () => {
        it('should return game status when game exists', () => {
            const gameId = '123';
            const game = { id: 123, gameName: 'Test Game' };

            req.params = { id: gameId };
            gameStore.get.mockReturnValue(game);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/status/:id');
            const handler = route.route.methods.get ? route.route.stack[0].handle : null;

            expect(handler).toBeDefined();
            handler(req, res);

            expect(gameStore.get).toHaveBeenCalledWith(123);
            expect(res.json).toHaveBeenCalledWith(game);
        });

        it('should return 404 when game does not exist', () => {
            const gameId = '999';

            req.params = { id: gameId };
            gameStore.get.mockReturnValue(null);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/status/:id');
            const handler = route.route.methods.get ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(gameStore.get).toHaveBeenCalledWith(999);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Game not found' });
        });

        it('should convert string id to number when getting game', () => {
            const gameId = '456';
            const game = { id: 456, gameName: 'Another Game' };

            req.params = { id: gameId };
            gameStore.get.mockReturnValue(game);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/status/:id');
            const handler = route.route.methods.get ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(gameStore.get).toHaveBeenCalledWith(456);
            expect(res.json).toHaveBeenCalledWith(game);
        });
    });

    describe('PUT /:id', () => {
        it('should add player to game successfully', () => {
            const gameId = '1';
            const playerId = 'player1';
            const game = { id: 1, players: [] };
            const updatedGame = { id: 1, players: [{ id: playerId }] };

            req.params = { id: gameId };
            req.body = { playerId };
            gameStore.get.mockReturnValue(game);
            setup.addPlayerToGame.mockReturnValue(updatedGame);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/:id');
            const handler = route.route.methods.put ? route.route.stack[0].handle : null;

            expect(handler).toBeDefined();
            handler(req, res);

            expect(gameStore.get).toHaveBeenCalledWith('1');
            expect(setup.addPlayerToGame).toHaveBeenCalledWith(game, playerId);
            expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
            expect(res.json).toHaveBeenCalledWith(updatedGame);
        });

        it('should handle adding multiple players to game', () => {
            const gameId = '1';
            const playerId = 'player2';
            const game = { id: 1, players: [{ id: 'player1' }] };
            const updatedGame = { id: 1, players: [{ id: 'player1' }, { id: playerId }] };

            req.params = { id: gameId };
            req.body = { playerId };
            gameStore.get.mockReturnValue(game);
            setup.addPlayerToGame.mockReturnValue(updatedGame);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/:id');
            const handler = route.route.methods.put ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(setup.addPlayerToGame).toHaveBeenCalledWith(game, playerId);
            expect(gameStore.update).toHaveBeenCalledWith(gameId, updatedGame);
            expect(res.json).toHaveBeenCalledWith(updatedGame);
        });

        it('should pass correct gameId and playerId to setup function', () => {
            const gameId = '5';
            const playerId = 'testPlayer';
            const game = { id: 5, players: [] };
            const updatedGame = { id: 5, players: [{ id: playerId }] };

            req.params = { id: gameId };
            req.body = { playerId };
            gameStore.get.mockReturnValue(game);
            setup.addPlayerToGame.mockReturnValue(updatedGame);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/:id');
            const handler = route.route.methods.put ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(setup.addPlayerToGame).toHaveBeenCalledWith(game, playerId);
        });
    });

    describe('GET /', () => {
        it('should return all games', () => {
            const games = [
                { id: 1, gameName: 'Game 1' },
                { id: 2, gameName: 'Game 2' }
            ];

            gameStore.getAll.mockReturnValue(games);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/');
            const handler = route.route.methods.get ? route.route.stack[0].handle : null;

            expect(handler).toBeDefined();
            handler(req, res);

            expect(gameStore.getAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(games);
        });

        it('should return empty array when no games exist', () => {
            gameStore.getAll.mockReturnValue([]);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/');
            const handler = route.route.methods.get ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(gameStore.getAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should return multiple games with correct structure', () => {
            const games = [
                { id: 1, gameName: 'Game 1', players: ['p1', 'p2'] },
                { id: 2, gameName: 'Game 2', players: ['p3', 'p4', 'p5'] },
                { id: 3, gameName: 'Game 3', players: [] }
            ];

            gameStore.getAll.mockReturnValue(games);

            const route = gameRouter.stack.find(layer => layer.route && layer.route.path === '/');
            const handler = route.route.methods.get ? route.route.stack[0].handle : null;

            handler(req, res);

            expect(res.json).toHaveBeenCalledWith(games);
            expect(res.json.mock.calls[0][0]).toHaveLength(3);
        });
    });
});
