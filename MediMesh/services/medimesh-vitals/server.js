require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const vitalRoutes = require('./routes/vitalRoutes');

const app = express();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-vitals-db';

app.use(cors());
app.use(express.json());

app.use('/api/vitals', vitalRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-vitals' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Vitals DB connected');
    app.listen(PORT, () => console.log(`❤️ medimesh-vitals running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
