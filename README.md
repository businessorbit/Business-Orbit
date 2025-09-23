# Business Orbit - Professional Networking Platform

A modern professional networking platform built with Next.js 14, TypeScript, and PostgreSQL. Connect with professionals, join chapters, participate in secret groups, and grow your network.

## 🚀 Features

- **User Authentication**: Email/password and OAuth (Google, LinkedIn) login
- **Profile Management**: Complete user profiles with skills, photos, and descriptions
- **Networking**: Invite system to connect with other professionals
- **Chapters**: Location-based professional groups
- **Secret Groups**: Exclusive communities for specific interests
- **Events**: Professional events and meetups
- **Consultation Services**: Book consultation sessions with experts
- **Admin Panel**: Manage users, events, and platform settings
- **Responsive Design**: Mobile-first design with modern UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL
- **Authentication**: JWT with cookies
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **OAuth**: Google, LinkedIn

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd newborbit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT
JWT_SECRET=your-jwt-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Cookie
COOKIE_SECRET=your-cookie-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE business_orbit;
```

2. Run the database setup script:
```bash
npm run db:setup
```

This will create all necessary tables, indexes, and triggers.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── chapters/      # Chapter management
│   │   ├── invites/       # Invite system
│   │   ├── preferences/   # User preferences
│   │   └── users/         # User management
│   ├── auth/              # Authentication pages
│   ├── onboarding/       # User onboarding
│   ├── profile/          # User profiles
│   └── admin/            # Admin panel
├── components/            # Reusable components
│   ├── ui/               # UI components (Radix UI)
│   └── admin/            # Admin-specific components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   ├── config/           # Configuration files
│   ├── database/         # Database setup and schema
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── public/               # Static assets
```

## 🔐 Authentication Flow

1. **Sign Up**: Users can create accounts with email/password or OAuth
2. **Invite System**: New users must send an invite to proceed
3. **Onboarding**: Users select chapters and secret groups
4. **Profile Setup**: Complete profile information
5. **Platform Access**: Full access to networking features

## 🗄️ Database Schema

### Users Table
- User profiles with authentication data
- OAuth integration (Google, LinkedIn)
- Profile photos and banners via Cloudinary

### Invites Table
- Invitation system for network growth
- Email-based invitations with status tracking

### User Preferences Table
- Onboarding data (chapters, secret groups)
- User preferences and settings

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📧 Email Configuration

The platform uses Nodemailer with Gmail for sending invitations. To set up:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS` environment variable

## 🎨 UI Components

The project uses:
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Custom design system** with consistent spacing and colors

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:setup     # Setup database tables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Ensure PostgreSQL is running
4. Check the database connection

## 🔄 Updates

The project is actively maintained. Check the repository for the latest updates and features.

---

**Built with ❤️ for professional networking**