require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const doctorRoutes = require('./routes/doctorRoutes');
const { seedDoctors } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-doctor-db';

app.use(cors());
app.use(express.json());

app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-doctor' }));

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('📦 Doctor DB connected');
    await seedDoctors();
    app.listen(PORT, () => console.log(`🧑‍⚕️ medimesh-doctor running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
