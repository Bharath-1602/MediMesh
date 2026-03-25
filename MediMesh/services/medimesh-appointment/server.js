require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-appointment-db';

app.use(cors());
app.use(express.json());

app.use('/api/appointments', appointmentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-appointment' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Appointment DB connected');
    app.listen(PORT, () => console.log(`📅 medimesh-appointment running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
