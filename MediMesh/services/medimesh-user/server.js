require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-user-db';

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-user' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 User DB connected');
    app.listen(PORT, () => console.log(`👤 medimesh-user running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
