import { describe, it, expect, beforeEach } from 'vitest';
import { registerChatSocket } from '../sockets/chat.socket.js';
import { createBasicSocketMocks, getSocketCallback, getEmitCall } from './utils/testHelpers.js';

describe('Chat Socket Events', () => {
    let io, socket;

    beforeEach(() => {
        const mocks = createBasicSocketMocks();
        io = mocks.io;
        socket = mocks.socket;
    });

    it('should register chat:message event listener', () => {
        registerChatSocket(io, socket);

        expect(socket.on).toHaveBeenCalledWith('chat:message', expect.any(Function));
    });

    it('should handle chat:message event and emit to lobby', () => {
        const lobbyId = 'lobby123';
        const userName = 'Player1';
        const message = 'Hello, everyone!';

        registerChatSocket(io, socket);

        const chatCallback = getSocketCallback(socket, 'chat:message');
        chatCallback({ lobbyId, userName, message });

        expect(io.to).toHaveBeenCalledWith(lobbyId);
        expect(io.emit).toHaveBeenCalledWith('chat:message', {
            userName,
            message
        });
    });

    it('should emit message with correct payload format', () => {
        const lobbyId = 'lobby456';
        const userName = 'TestUser';
        const message = 'Test message';

        registerChatSocket(io, socket);

        const chatCallback = getSocketCallback(socket, 'chat:message');
        chatCallback({ lobbyId, userName, message });

        const emitCall = getEmitCall(io, 'chat:message');
        expect(emitCall).toBeDefined();
        expect(emitCall[1]).toEqual({
            userName,
            message
        });
    });

    it('should handle multiple chat messages independently', () => {
        registerChatSocket(io, socket);
        const chatCallback = getSocketCallback(socket, 'chat:message');

        const message1 = { lobbyId: 'lobby1', userName: 'User1', message: 'First' };
        const message2 = { lobbyId: 'lobby2', userName: 'User2', message: 'Second' };

        chatCallback(message1);
        chatCallback(message2);

        expect(io.to).toHaveBeenCalledTimes(2);
        expect(io.to).toHaveBeenNthCalledWith(1, 'lobby1');
        expect(io.to).toHaveBeenNthCalledWith(2, 'lobby2');
    });
});
