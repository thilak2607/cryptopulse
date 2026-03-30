const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const User = require('./models/User');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;

// 🔴 MongoDB (skip if not using cloud DB)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cryptopulse')
  .then(() => console.log('MongoDB Connected'))
  .catch(() => console.log('MongoDB skipped (no DB)'));

// 🔥 MOCK DATA
const recentData = {
  BTC: { price: 50000 },
  ETH: { price: 3000 },
  BNB: { price: 400 },
  SOL: { price: 100 }
};

// 🔥 Fake live updates
setInterval(() => {
  Object.keys(recentData).forEach(symbol => {
    const change = (Math.random() - 0.5) * 50;
    recentData[symbol].price += change;

    io.emit('price-update', {
      symbol,
      price: recentData[symbol].price
    });
  });
}, 5000);

// 🔥 Socket
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('initial-data', recentData);
});

// 🔥 Simple API (test)
app.get('/', (req, res) => {
  res.send('CryptoPulse Backend Running 🚀');
});

// 🔥 News API
app.get('/api/news', async (req, res) => {
  try {
    res.json({ articles: [], sentiment: 0.5 });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// 🔥 Portfolio
app.get('/api/portfolio/:userId', async (req, res) => {
  res.json({
    cashBalance: 8350000,
    holdings: {},
    tradeHistory: []
  });
});

// 🔥 Trade
app.post('/api/trade', (req, res) => {
  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
