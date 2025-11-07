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
        
        // --- Connection Strings & Secrets ---
        // IMPORTANT: Set these from environment variables or secure storage
        DATABASE_URL: process.env.DATABASE_URL || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        COOKIE_SECRET: process.env.COOKIE_SECRET || '',
        
        // --- Internal URLs (for server-to-server) ---
        // Use localhost for internal communication (Nginx will proxy external HTTPS)
        APP_BASE_URL: 'http://localhost:3001',
        
        // --- External/Public URLs ---
        CLIENT_URL: 'https://www.businessorbit.org',
        NEXT_PUBLIC_APP_URL: 'https://www.businessorbit.org',
        NEXT_PUBLIC_APP_BASE_URL: 'https://api.businessorbit.org',
        
        // Chat server - use HTTPS endpoint if proxied through Nginx, or direct IP
        NEXT_PUBLIC_CHAT_SOCKET_URL: 'http://51.20.78.210:4000', // TODO: Change to wss://api.businessorbit.org:8443 after SSL setup
        
        // --- Third-Party Credentials ---
        // IMPORTANT: Replace these with actual values from environment variables or secure storage
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        
        // Cloudinary
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
        CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
        
        // Email
        EMAIL_USER: process.env.EMAIL_USER || '',
        EMAIL_PASS: process.env.EMAIL_PASS || '',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
        
        // Admin
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
        
        // Navigator AI
        NAVIGATOR_API_URL: process.env.NAVIGATOR_API_URL || '',
        NAVIGATOR_API_KEY: process.env.NAVIGATOR_API_KEY || ''
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
        NEXT_PUBLIC_APP_BASE_URL: 'https://api.businessorbit.org',
        NEXT_PUBLIC_CHAT_SOCKET_URL: 'http://51.20.78.210:4000',
        // Database connection for API routes
        DATABASE_URL: process.env.DATABASE_URL || ''
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












