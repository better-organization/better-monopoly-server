// Test setup file
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env['NODE_ENV'] = 'test';

let mongoServer: MongoMemoryServer;

// Global setup: Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'user', // Use 'user' database name
    },
  });
  const mongoUri = mongoServer.getUri();
  process.env['MONGO_URI'] = mongoUri;

  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri, {
    dbName: 'user', // Connect to 'user' database
  });
}, 60000); // Increase timeout for MongoDB setup

// Global teardown: Close connection and stop MongoDB after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);
