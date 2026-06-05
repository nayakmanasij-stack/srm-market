import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('DB Error:', err));

app.get('/', (req, res) => {
  res.json({ message: 'SRM Marketplace API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});