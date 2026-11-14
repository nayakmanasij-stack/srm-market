import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 80 },
  description: { type: String, required: true, maxlength: 500 },
  price: { type: Number, required: true, min: 1, max: 100000 },
  category: { type: String, required: true },
}, { timestamps: true, versionKey: false });

try {
  if (!process.env.MONGO_URI) throw new Error('Missing database configuration');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  const app = createApp(mongoose.model('Listing', listingSchema));
  const port = process.env.PORT || 5000;
  app.listen(port, process.env.HOST || '127.0.0.1', () => {
    console.log(`MongoDB connected. SRM Market API listening on port ${port}.`);
  });
} catch {
  console.error('Could not connect to MongoDB. Check your server/.env settings and database access.');
  process.exitCode = 1;
}
