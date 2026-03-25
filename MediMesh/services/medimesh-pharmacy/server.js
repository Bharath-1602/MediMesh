require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const pharmacyRoutes = require('./routes/pharmacyRoutes');

const app = express();
const PORT = process.env.PORT || 5006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-pharmacy-db';

app.use(cors());
app.use(express.json());

app.use('/api/pharmacy', pharmacyRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-pharmacy' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Pharmacy DB connected');
    app.listen(PORT, () => console.log(`💊 medimesh-pharmacy running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
