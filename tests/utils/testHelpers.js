import { vi } from 'vitest';

// Game state creation helpers
export const createEmptyGame = (lobbyId = 'lobby123') => ({
    id: lobbyId,
    players: [],
    pullDeck: [],
    playDeck: []
});

export const createPlayer = (id, userName, isReady = false) => ({
    id,
    userName,
    isReady,
    hand: []
});

export const createGameWithPlayers = (lobbyId, players) => ({
    id: lobbyId,
    players,
    pullDeck: [],
    playDeck: []
});

export const createGameForStart = (lobbyId) => ({
    id: lobbyId,
    players: [
        { id: 'p1', userName: 'Player1', isReady: true, hand: ['3H', '4S', '5D', '6C', '7H'] },
        { id: 'p2', userName: 'Player2', isReady: true, hand: ['8S', '9D', '10C', 'JH', 'QS'] }
    ],
    pullDeck: Array(42).fill('card'),
    playDeck: [],
    currentPlayerId: 'p1'
});

// Socket testing helpers
export const createSocketMocks = () => {
    return {
        io: {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        },
        socket: {
            on: vi.fn(),
            join: vi.fn(),
            leave: vi.fn()
        }
    };
};

export const createBasicSocketMocks = () => {
    return {
        io: {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        },
        socket: {
            on: vi.fn()
        }
    };
};

export const createGameSocketMocks = (socketId = 'socket123') => {
    return {
        io: {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        },
        socket: {
            on: vi.fn(),
            id: socketId
        }
    };
};

export const createDisconnectSocketMocks = (socketId = 'socket123', userName = 'Player1') => {
    return {
        io: {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn()
        },
        socket: {
            on: vi.fn(),
            leave: vi.fn(),
            id: socketId,
            userName
        }
    };
};

export const getSocketCallback = (socket, eventName) => {
    const call = socket.on.mock.calls.find(c => c[0] === eventName);
    return call ? call[1] : null;
};

export const getEmitCall = (io, eventName, filter = null) => {
    return io.emit.mock.calls.find(call => 
        call[0] === eventName && (!filter || filter(call[1]))
    );
};
