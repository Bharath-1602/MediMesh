require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const forumRoutes = require('./routes/forumRoutes');

const app = express();
const PORT = process.env.PORT || 5009;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimesh-forum-db';

app.use(cors());
app.use(express.json());

app.use('/api/forum', forumRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'medimesh-forum' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Forum DB connected');
    app.listen(PORT, () => console.log(`🌐 medimesh-forum running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
