module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/Business-Orbit',
      exec_mode: 'fork',
      instances: 1,
      env_file: '.env.local',
      // All environment variables embedded directly here
      env: {
        // --- Infrastructure/Server ---
        NODE_ENV: 'production',
        PORT: 3001,
        CHAT_SERVER_PORT: 4000,
        
      
        APP_BASE_URL: 'http://localhost:3001',
        
        // --- External/Public URLs ---
        CLIENT_URL: 'https://www.businessorbit.org',
        NEXT_PUBLIC_APP_URL: 'https://www.businessorbit.org',
        NEXT_PUBLIC_APP_BASE_URL: 'https://api.businessorbit.org',
        
        // Chat server - use HTTPS endpoint if proxied through Nginx, or direct IP
        NEXT_PUBLIC_CHAT_SOCKET_URL: 'http://51.20.78.210:4000' // TODO: Change to wss://api.businessorbit.org:8443 after SSL setup
      }
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/Business-Orbit',
      exec_mode: 'fork',
      instances: 1,
      env_file: '.env.local',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Frontend needs these to connect to backend
        NEXT_PUBLIC_APP_URL: 'https://www.businessorbit.org',
        NEXT_PUBLIC_APP_BASE_URL: 'http://localhost:3001',
        NEXT_PUBLIC_CHAT_SOCKET_URL: 'http://51.20.78.210:4000'
      }
    },
    {
      name: 'chat-server',
      script: 'npm',
      args: 'run chat:dev',
      cwd: '/home/ubuntu/Business-Orbit',
      exec_mode: 'fork',
      instances: 1,
      env_file: '.env.local',
      // Chat server needs its own set of variables
      env: {
        NODE_ENV: 'production',
        CHAT_SERVER_PORT: 4000,
        DATABASE_URL: process.env.DATABASE_URL || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        APP_BASE_URL: 'http://localhost:3001', // For internal API calls from chat server
        NEXT_PUBLIC_CHAT_SOCKET_URL: 'http://51.20.78.210:4000' // TODO: Change after SSL setup
      }
    }
  ],
};