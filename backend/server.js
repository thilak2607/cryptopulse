const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
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

// Connect to Binance WebSocket for multiple streams
// symbols: btcusdt, ethusdt, bnbusdt, solusdt
const streams = ['btcusdt@trade', 'ethusdt@trade', 'bnbusdt@trade', 'solusdt@trade'];
const binanceWs = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`);

const recentData = {
  BTC: { price: 0, change: 0, history: [] },
  ETH: { price: 0, change: 0, history: [] },
  BNB: { price: 0, change: 0, history: [] },
  SOL: { price: 0, change: 0, history: [] }
};

binanceWs.on('message', async (data) => {
  const parsed = JSON.parse(data);
  if (parsed.data) {
    const symbol = parsed.data.s.replace('USDT', '');
    const price = parseFloat(parsed.data.p);
    
    if (recentData[symbol]) {
        recentData[symbol].price = price;
        // Broadcast to clients
        io.emit('price-update', { symbol, price, timestamp: new Date() });

        // Save randomly to limit DB writes (~1 in 50 trades)
        if (Math.random() < 0.02) {
           await CryptoData.create({ symbol, price });
        }
    }
  }
});

// News API sentiment fetch
app.get('/api/news', async (req, res) => {
    try {
        const NEWS_API_KEY = process.env.NEWS_API_KEY;
        if (!NEWS_API_KEY) return res.status(200).json({ articles: [], sentiment: 0.5 });
        
        const response = await axios.get(`https://newsapi.org/v2/everything?q=cryptocurrency+OR+bitcoin+OR+crypto&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`);
        
        const articles = response.data.articles || [];
        // simple mock sentiment based on random titles 
        // in real life we could use a JS natural sentiment library, or send it to python endpoint
        let fakeSentiment = 0.5 + (Math.random() * 0.4 - 0.2); 
        
        res.json({ articles: articles.slice(0, 5), sentiment: fakeSentiment });
    } catch (err) {
        console.error("News API Error: ", err.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.get('/api/history/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const data = await CryptoData.find({ symbol }).sort({ timestamp: -1 }).limit(100);
        res.json(data.reverse());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  socket.emit('initial-data', recentData);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// --- Trade & Portfolio API --
app.get('/api/portfolio/:userId', async (req, res) => {
  try {
    let user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      // Create a default user on first visit with INR equivalent of 100k USD
      user = await User.create({ userId: req.params.userId, cashBalance: 8350000 });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

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
      const currentAsset = user.holdings.get(symbol) || 0;
      user.holdings.set(symbol, currentAsset + amount);
    } else if (side === 'SELL') {
      const currentAsset = user.holdings.get(symbol) || 0;
      if (currentAsset < amount) {
         return res.status(400).json({ error: 'Insufficient asset balance' });
      }
      user.cashBalance += totalCost;
      user.holdings.set(symbol, currentAsset - amount);
    }

    user.tradeHistory.push({ symbol, type: side, amount, price });
    await user.save();
    
    // Broadcast portfolio update if using socket, or just rely on client refetch.
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Trade failed' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
