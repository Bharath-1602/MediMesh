require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const PORT = process.env.PORT || 5008;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-complaint-db';

app.use(cors());
app.use(express.json());

app.use('/api/complaints', complaintRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-complaint' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Complaint DB connected');
    app.listen(PORT, () => console.log(`🧾 medimesh-complaint running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
