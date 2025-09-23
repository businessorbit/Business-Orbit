const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Simple in-memory store with TTL; replace with DB layer for production
const messagesByChapter = {};

// Message TTL: 2 days in milliseconds
const MESSAGE_TTL = 2 * 24 * 60 * 60 * 1000; // 2 days

// Cleanup old messages every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(messagesByChapter).forEach(chapterId => {
    messagesByChapter[chapterId] = messagesByChapter[chapterId].filter(msg => {
      const messageTime = new Date(msg.timestamp).getTime();
      return (now - messageTime) < MESSAGE_TTL;
    });
    
    // Remove empty chapter arrays
    if (messagesByChapter[chapterId].length === 0) {
      delete messagesByChapter[chapterId];
    }
  });
  
  console.log(`Message cleanup completed. Active chapters: ${Object.keys(messagesByChapter).length}`);
}, 60 * 60 * 1000); // Run every hour

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get messages for a chapter
app.get('/messages/:chapterId', (req, res) => {
  try {
    const { chapterId } = req.params;
    const messages = messagesByChapter[chapterId] || [];
    console.log(`API request for chapter ${chapterId}: returning ${messages.length} messages`);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Send message via HTTP (fallback when WebSocket fails)
app.post('/messages/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const message = req.body;
    
    // Validate membership (same as WebSocket)
    if (!message.userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }
    
    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const membershipRes = await fetch(`${appBaseUrl}/api/users/${encodeURIComponent(message.userId)}/chapters`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!membershipRes.ok) {
      return res.status(403).json({ success: false, error: 'membership check failed' });
    }
    
    const membershipData = await membershipRes.json();
    const isMember = !!membershipData?.success && Array.isArray(membershipData.chapters) && 
                    membershipData.chapters.some(c => String(c.id) === String(chapterId));
    
    if (!isMember) {
      return res.status(403).json({ success: false, error: 'not a member of this chapter' });
    }
    
    // Store message
    if (!messagesByChapter[chapterId]) {
      messagesByChapter[chapterId] = [];
    }
    
    const stored = {
      ...message,
      chapterId,
      id: message.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: message.timestamp || new Date().toISOString(),
    };
    
    messagesByChapter[chapterId].push(stored);
    
    // Broadcast to WebSocket clients
    const room = `chapter-${chapterId}`;
    io.to(room).emit('newMessage', stored);
    
    console.log(`HTTP message stored: ${stored.content} (ID: ${stored.id}) in chapter ${chapterId}`);
    res.json({ success: true, message: stored });
  } catch (error) {
    console.error('Error handling HTTP message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

io.on('connection', (socket) => {
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
      const isMember = !!data?.success && Array.isArray(data.chapters) && 
                      data.chapters.some(c => String(c.id) === String(chapterId));
      
      if (!isMember) {
        ack?.({ ok: false, error: 'not a member of this chapter' });
        return;
      }
      
      const room = `chapter-${chapterId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room} as user ${userId}`);
      ack?.({ ok: true });
    } catch (e) {
      console.error('joinRoom error', e);
      ack?.({ ok: false, error: 'internal join error' });
    }
  });

  socket.on('sendMessage', (message) => {
    try {
      const room = `chapter-${message.chapterId}`;

      // Persist message (swap to DB in production)
      if (!messagesByChapter[message.chapterId]) {
        messagesByChapter[message.chapterId] = [];
      }
      
      // Use the message ID from client to prevent duplicates
      const stored = {
        ...message,
        id: message.id, // Use client-provided ID
        timestamp: message.timestamp || new Date().toISOString(),
      };
      
      messagesByChapter[message.chapterId].push(stored);
      io.to(room).emit('newMessage', stored);
      console.log(`Message stored and broadcast: ${stored.content} (ID: ${stored.id}) in chapter ${message.chapterId}`);
      console.log(`Total messages in chapter ${message.chapterId}: ${messagesByChapter[message.chapterId].length}`);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
});

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
  console.log(`Chat server listening on http://localhost:${PORT}`);
});
