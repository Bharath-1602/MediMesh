require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { seedAdmin, seedDoctors } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-auth-db';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-auth' }));

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('📦 Auth DB connected');
    await seedAdmin();
    await seedDoctors();
    app.listen(PORT, () => console.log(`🔐 medimesh-auth running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
