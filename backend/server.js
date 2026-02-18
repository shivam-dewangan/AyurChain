const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Start server - use port 5001 to match frontend expectation
const PORT = process.env.PORT || 5001;

// Allow all origins for development
const corsOptions = {
  origin: '*', // Allow all origins for development
  credentials: true
};

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: corsOptions
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Import routes
const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
const purchaseRoutes = require('./routes/purchases');
const profileRoutes = require('./routes/profiles');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const payoutRoutes = require('./routes/payouts');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payouts', payoutRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AyurChain API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make notification helper available
const createNotification = async (userId, notificationData) => {
  const io = app.get('io');
  io.to(userId).emit('notification', notificationData);
};

app.set('createNotification', createNotification);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: config.env.nodeEnv === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AyurChain Backend Server                             ║
║                                                           ║
║   Status: Running                                        ║
║   Port: ${PORT}                                            ║
║   Environment: ${config.env.nodeEnv.padEnd(12)}                   ║
║                                                           ║
║   API Endpoints:                                         ║
║   - Auth:        /api/auth                               ║
║   - Batches:     /api/batches                            ║
║   - Purchases:   /api/purchases                          ║
║   - Profiles:    /api/profiles                           ║
║   - Admin:       /api/admin                              ║
║   - AI:          /api/ai                                 ║
║                                                           ║
║   WebSocket: Ready for real-time connections              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };

