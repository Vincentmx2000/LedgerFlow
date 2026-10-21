import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ledgerflow';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Initial connection failed: ${error.message}`);
    console.warn(`[MongoDB] Tip: Ensure MongoDB service is running on port 27017, or set MONGO_URI in server/.env (e.g. MongoDB Atlas).`);
    // Retry in background so server does not die
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected successfully.');
});
