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

// Security & Parsing Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Route
app.get('/api/health', (req, res) => {
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
});

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
