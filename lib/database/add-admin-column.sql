-- Add is_admin column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an admin user (replace with your email)
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';

-- Or create a new admin user
-- INSERT INTO users (name, email, password_hash, is_admin) 
-- VALUES ('Admin User', 'admin@example.com', 'hashed_password', TRUE);



