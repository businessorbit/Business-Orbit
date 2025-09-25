# Chat Features Setup

This application includes real-time chat features for chapters. The chat system can work in two modes:

## Mode 1: HTTP-Only (Default)
- Messages are sent and received via HTTP API calls
- No real-time updates (users need to refresh to see new messages)
- Works without any additional setup
- Perfect for basic functionality

## Mode 2: Real-time with WebSocket (Optional)
- Messages are sent and received in real-time
- Users see new messages instantly
- Requires running a separate chat server

## Setting up Real-time Chat

### 1. Install Dependencies
Make sure you have `tsx` installed:
```bash
npm install tsx --save-dev
```

### 2. Start the Chat Server
Run one of these commands:

```bash
# Option 1: Direct tsx command
npm run chat:dev

# Option 2: Using the helper script
npm run chat:start
```

### 3. Configure Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_CHAT_SOCKET_URL=http://localhost:4000
```

### 4. Start the Main Application
In a separate terminal:
```bash
npm run dev
```

## How it Works

- The chat server runs on port 4000 by default
- The main Next.js app runs on port 3000
- When the chat server is available, the app uses WebSocket for real-time features
- When the chat server is not available, the app falls back to HTTP-only mode
- All messages are stored in the database regardless of the mode

## Troubleshooting

### Chat Server Won't Start
- Make sure port 4000 is available
- Check that `tsx` is installed: `npm install tsx --save-dev`
- Verify your database connection is working

### Real-time Features Not Working
- Check that the chat server is running: `curl http://localhost:4000/health`
- Verify the `NEXT_PUBLIC_CHAT_SOCKET_URL` environment variable is set
- Check browser console for WebSocket connection errors

### Messages Not Appearing
- In HTTP-only mode, refresh the page to see new messages
- In real-time mode, check that you're a member of the chapter
- Verify your authentication is working

## Development Notes

- The chat server automatically retries connections
- Messages are validated for length (max 4000 characters)
- Only chapter members can send messages
- All messages are persisted to the database
- The system gracefully handles server restarts


