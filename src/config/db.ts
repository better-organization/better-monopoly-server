import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env['MONGO_URI'];
  if (!mongoUri) {
    console.warn('MONGO_URI is not set; skipping MongoDB connection.');
    return;
  }

  mongoose.set('strictQuery', false);

  try {
    // Explicitly specify 'user' database for user and auth data
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'user',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(
      `Using database: ${conn.connection.db?.databaseName || 'user'}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`MongoDB connection error: ${message}`);
    throw error;
  }
};

export default connectDB;
