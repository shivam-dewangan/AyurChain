// Load environment variables
require('dotenv').config();

module.exports = {
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: '7d', // Token expires in 7 days
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurchain',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB default
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
};

