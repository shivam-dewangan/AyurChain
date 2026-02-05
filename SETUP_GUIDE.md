# AyurChain MERN Stack - Complete Setup Guide

## ✅ Conversion Complete

Your AyurChain project has been successfully converted from React + Supabase to MERN Stack (MongoDB, Express, React, Node.js).

## 🏗️ Project Structure

```
AyurChain/
├── backend/                    # Node.js + Express + MongoDB
│   ├── config/                # Configuration files
│   │   ├── db.js             # MongoDB connection
│   │   └── index.js          # Environment config
│   ├── middleware/            # Auth & role middleware
│   │   ├── auth.js           # JWT authentication
│   │   └── role.js           # Role-based access control
│   ├── models/                # Mongoose models
│   │   ├── User.js           # User model
│   │   ├── FarmerDetail.js   # Farmer profile
│   │   ├── CompanyDetail.js  # Company profile
│   │   ├── Batch.js          # Herb batch
│   │   ├── Purchase.js       # Purchase transactions
│   │   └── Notification.js   # Notifications
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── batches.js        # Batch management
│   │   ├── profiles.js       # User profiles
│   │   ├── purchases.js      # Purchase management
│   │   └── admin.js          # Admin operations
│   ├── .env                   # Environment variables
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
│
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── api/              # API client (replaces Supabase)
│   │   │   └── client.js     # Axios-based API client
│   │   ├── components/       # UI components (unchanged)
│   │   ├── pages/            # Page components (updated)
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   ├── services/         # Service layer
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   ├── .env                  # Frontend environment variables
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── index.html            # HTML template
│
├── start.sh                   # Startup script
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **npm** or **yarn**

### 2. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf

# Check if MongoDB is running
brew services list | grep mongodb
```

### 3. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayurchain
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:5173
EOF
```

**Frontend (.env):**
```bash
cd frontend
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 5. Start the Application

**Option A: Use the startup script (Recommended)**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Start servers manually**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 🔄 Key Changes from Supabase

| Feature | Supabase | MERN Stack |
|---------|----------|------------|
| **Database** | PostgreSQL | MongoDB |
| **Authentication** | Supabase Auth | JWT + Express middleware |
| **Real-time** | Supabase subscriptions | Socket.io |
| **API Calls** | Supabase client | Axios HTTP client |
| **File Storage** | Supabase Storage | Cloudinary (configured) |
| **User Management** | Built-in | Custom User model |

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Batches
- `GET /api/batches` - Get all batches (with filters)
- `GET /api/batches/:id` - Get batch by ID
- `POST /api/batches` - Create new batch (farmer only)
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Profiles
- `POST /api/profiles/farmer` - Create/update farmer profile
- `GET /api/profiles/farmer` - Get farmer profile
- `POST /api/profiles/company` - Create/update company profile
- `GET /api/profiles/company` - Get company profile
- `GET /api/profiles/farmer/:id` - Get farmer by ID

### Purchases
- `GET /api/purchases` - Get purchases (filtered by role)
- `POST /api/purchases` - Create purchase (company only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/farmers/pending` - Get pending farmers
- `PATCH /api/admin/farmers/:id/approve` - Approve farmer
- `PATCH /api/admin/farmers/:id/reject` - Reject farmer
- `GET /api/admin/batches/pending` - Get pending batches
- `PATCH /api/admin/batches/:id/approve` - Approve batch
- `PATCH /api/admin/batches/:id/reject` - Reject batch

## 🎯 Features

✅ **User Authentication** - JWT-based secure authentication
✅ **Role-Based Access** - Farmer, Company, Admin, Consumer roles
✅ **Batch Management** - Create, update, track herb batches
✅ **Purchase System** - Companies can purchase from farmers
✅ **Real-time Notifications** - Socket.io for live updates
✅ **Profile Management** - Detailed farmer and company profiles
✅ **Admin Dashboard** - Approve farmers and batches
✅ **QR Code Generation** - Batch verification system
✅ **Same UI/UX** - All Tailwind CSS and shadcn/ui components preserved

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

Make sure the backend `.env` has:
```
FRONTEND_URL=http://localhost:5173
```

And frontend `.env` has:
```
VITE_API_URL=http://localhost:5000/api
```

### Authentication Issues

1. Clear browser localStorage:
```javascript
// In browser console
localStorage.clear()
```

2. Check if JWT_SECRET is set in backend `.env`

3. Verify token is being sent in requests (check Network tab)

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

The backend will restart automatically when you make changes.

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

The frontend has Hot Module Replacement (HMR) for instant updates.

### Database Management

```bash
# Connect to MongoDB shell
mongosh

# Use AyurChain database
use ayurchain

# View collections
show collections

# Query users
db.users.find().pretty()

# Query batches
db.batches.find().pretty()

# Drop database (careful!)
db.dropDatabase()
```

## 📝 Testing the Application

### 1. Create Admin User

```bash
# Using MongoDB shell
mongosh
use ayurchain

db.users.insertOne({
  email: "admin@ayurchain.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgaSUu", // password: admin123
  fullName: "Admin User",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Test User Flow

1. **Register as Farmer**
   - Go to http://localhost:5173/auth
   - Sign up with farmer role
   - Complete farmer profile

2. **Admin Approval**
   - Login as admin
   - Approve the farmer

3. **Create Batch**
   - Login as farmer
   - Create a new herb batch

4. **Register as Company**
   - Sign up with company role
   - Complete company profile

5. **Purchase Batch**
   - Login as company
   - Purchase from available batches

## 🚀 Production Deployment

### Backend (Node.js)

1. Set production environment variables
2. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name ayurchain-backend
```

### Frontend (React)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Serve with nginx or deploy to Vercel/Netlify

### Database (MongoDB)

Use MongoDB Atlas for production:
1. Create cluster at https://cloud.mongodb.com
2. Update `MONGODB_URI` in backend `.env`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check backend and frontend logs for errors

## 📄 License

This project is part of AyurChain - Blockchain-based Ayurvedic Herb Traceability System.