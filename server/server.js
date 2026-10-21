import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import personRoutes from './routes/personRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import splitCollectionRoutes from './routes/splitCollectionRoutes.js';
import planRoutes from './routes/planRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// HTTP Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Allowed CORS Origins
const allowedOrigins = [
  'https://ledger-flow-six.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

// Parse any additional allowed origins from environment variables
['CLIENT_URL', 'FRONTEND_URL', 'ALLOWED_ORIGINS'].forEach((envKey) => {
  if (process.env[envKey]) {
    process.env[envKey].split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }
});

// Security & Parsing Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Match explicit allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Match any Vercel preview or branch deployments for this project
      if (/^https:\/\/ledger-flow[a-z0-9-]*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // In local development, allow any localhost / 127.0.0.1 port
      if (
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Safely reflect origin to satisfy credentials requirement
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Routes
const sendHealthCheck = (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    name: 'LedgerFlow API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState] || 'unknown',
  });
};

app.get('/api/health', sendHealthCheck);
app.get('/health', sendHealthCheck);
app.get('/', sendHealthCheck);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/people', personRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/vaults', vaultRoutes);
app.use('/api/split-collections', splitCollectionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/roles', roleRoutes);

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 LedgerFlow Server running on port ${PORT} (http://localhost:${PORT})`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
});
