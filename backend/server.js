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
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cryptopulse';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Crypto Data Schema
const CryptoDataSchema = new mongoose.Schema({
  symbol: String,
  price: Number,
  timestamp: { type: Date, default: Date.now }
});

const CryptoData = mongoose.model('CryptoData', CryptoDataSchema);

// 🔥 MOCK DATA (since WebSocket disabled)
const recentData = {
  BTC: { price: 50000, change: 0, history: [] },
  ETH: { price: 3000, change: 0, history: [] },
  BNB: { price: 400, change: 0, history: [] },
  SOL: { price: 100, change: 0, history: [] }
};

// 🔥 Send dummy updates every 5 sec (so UI still works)
setInterval(() => {
  Object.keys(recentData).forEach(symbol => {
    const randomChange = (Math.random() - 0.5) * 100;
    recentData[symbol].price += randomChange;

    io.emit('price-update', {
      symbol,
      price: recentData[symbol].price,
      timestamp: new Date()
    });
  });
}, 5000);

// News API
app.get('/api/news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) return res.json({ articles: [], sentiment: 0.5 });

    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`
    );

    res.json({
      articles: response.data.articles.slice(0, 5),
      sentiment: 0.5
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// History API
app.get('/api/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const data = await CryptoData.find({ symbol }).sort({ timestamp: -1 }).limit(100);
    res.json(data.reverse());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('initial-data', recentData);
});

// Portfolio API
app.get('/api/portfolio/:userId', async (req, res) => {
  try {
    let user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      user = await User.create({ userId: req.params.userId, cashBalance: 8350000 });
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// Trade API
app.post('/api/trade', async (req, res) => {
  const { userId, symbol, side, amount, price } = req.body;

  try {
    let user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalCost = amount * price;

    if (side === 'BUY') {
      if (user.cashBalance < totalCost) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      user.cashBalance -= totalCost;
      user.holdings.set(symbol, (user.holdings.get(symbol) || 0) + amount);
    } else {
      user.cashBalance += totalCost;
      user.holdings.set(symbol, (user.holdings.get(symbol) || 0) - amount);
    }

    await user.save();
    res.json(user);

  } catch (err) {
    res.status(500).json({ error: 'Trade failed' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
