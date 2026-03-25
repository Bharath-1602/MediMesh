require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ambulanceRoutes = require('./routes/ambulanceRoutes');

const app = express();
const PORT = process.env.PORT || 5007;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-ambulance-db';

app.use(cors());
app.use(express.json());

app.use('/api/ambulances', ambulanceRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-ambulance' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Ambulance DB connected');
    app.listen(PORT, () => console.log(`🚑 medimesh-ambulance running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
