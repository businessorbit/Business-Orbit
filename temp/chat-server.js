"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
// Simple in-memory store; replace with DB layer for production
const messagesByChapter = {};
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: true, credentials: true },
});
const socketSession = {};
io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('Socket connected', socket.id);
    socket.on('joinRoom', async ({ chapterId, userId }, ack) => {
        try {
            if (!chapterId || !userId) {
                ack?.({ ok: false, error: 'chapterId and userId required' });
                return;
            }
            const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
            // Validate membership by calling existing API
            const res = await fetch(`${appBaseUrl}/api/users/${encodeURIComponent(userId)}/chapters`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                ack?.({ ok: false, error: `membership check failed (${res.status})` });
                return;
            }
            const data = await res.json();
            const isMember = !!data?.success && Array.isArray(data.chapters) && data.chapters.some(c => String(c.id) === String(chapterId));
            if (!isMember) {
                ack?.({ ok: false, error: 'not a member of this chapter' });
                return;
            }
            const room = `chapter-${chapterId}`;
            socket.join(room);
            socketSession[socket.id] = { userId, chapterId };
            // eslint-disable-next-line no-console
            console.log(`Socket ${socket.id} joined ${room} as user ${userId}`);
            ack?.({ ok: true });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error('joinRoom error', e);
            ack?.({ ok: false, error: 'internal join error' });
        }
    });
    socket.on('sendMessage', (message) => {
        const session = socketSession[socket.id];
        if (!session || String(session.chapterId) !== String(message.chapterId) || String(session.userId) !== String(message.senderId)) {
            // Ignore messages from sockets that have not joined/validated
            return;
        }
        const room = `chapter-${message.chapterId}`;
        // Persist message (swap to DB in production)
        if (!messagesByChapter[message.chapterId])
            messagesByChapter[message.chapterId] = [];
        const stored = {
            ...message,
            id: message.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: message.timestamp || new Date().toISOString(),
        };
        messagesByChapter[message.chapterId].push(stored);
        io.to(room).emit('newMessage', stored);
    });
    socket.on('disconnect', () => {
        // eslint-disable-next-line no-console
        console.log('Socket disconnected', socket.id);
        delete socketSession[socket.id];
    });
});
const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Chat server listening on http://localhost:${PORT}`);
});
