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
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cryptopulse')
  .then(() => console.log('MongoDB Connected'))
  .catch(() => console.log('MongoDB skipped (no DB)'));

// Symbol to CoinGecko ID mapping
const CG_MAP = { BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana' };

// Cache for prices to prevent API rate limits leaving us with 0
const priceCache = {
  BTC: { price: 65000, change: 0, lastUpdated: Date.now() },
  ETH: { price: 3500, change: 0, lastUpdated: Date.now() },
  BNB: { price: 600, change: 0, lastUpdated: Date.now() },
  SOL: { price: 150, change: 0, lastUpdated: Date.now() }
};

const fetchRealPrice = async (symbol) => {
  try {
    const { data } = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`, { timeout: 3000 });
    const price = parseFloat(data.lastPrice);
    const change = parseFloat(data.priceChangePercent);
    if (!isNaN(price) && price > 0) return { price, change };
  } catch (err) {
    console.error(`Binance fetch failed for ${symbol}`);
  }

  try {
    const cgId = CG_MAP[symbol] || symbol.toLowerCase();
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true`, { timeout: 3000 });
    if (data[cgId] && data[cgId].usd) {
      return { price: data[cgId].usd, change: data[cgId].usd_24h_change || 0 };
    }
  } catch (err) {
    console.error(`CoinGecko fetch failed for ${symbol}`);
  }

  return { price: priceCache[symbol].price, change: priceCache[symbol].change };
};

// Poll APIs and update cache
setInterval(async () => {
  const symbols = ['BTC', 'ETH', 'BNB', 'SOL'];
  for (const symbol of symbols) {
    const freshData = await fetchRealPrice(symbol);
    if (freshData.price > 0) {
      priceCache[symbol] = { price: freshData.price, change: freshData.change, lastUpdated: Date.now() };
    }
    
    // Broadcast via socket
    io.emit('price-update', {
      symbol,
      price: priceCache[symbol].price,
      change: priceCache[symbol].change,
      timestamp: priceCache[symbol].lastUpdated
    });
  }
}, 5000);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('initial-data', priceCache);
});

// API Routes
app.get('/', (req, res) => res.send('CryptoPulse Backend Running 🚀'));

app.get('/api/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const { data } = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=24`, { timeout: 3000 });
    const history = data.map(kline => ({ timestamp: kline[0], price: parseFloat(kline[4]) }));
    res.json(history);
  } catch(err) {
    const currentPrice = priceCache[symbol]?.price || 100;
    const history = [];
    let p = currentPrice;
    for(let i=24; i>=0; i--) {
       history.push({ timestamp: Date.now() - (i*3600*1000), price: p });
       p = p * (1 + (Math.random() - 0.5)*0.01);
    }
    res.json(history.reverse());
  }
});

app.get('/api/news', async (req, res) => {
  try {
    res.json({ articles: [
      {title: "Institutional flows drive market sentiment upward", url:"#"},
      {title: "New comprehensive regulatory framework proposed in EU", url:"#"},
      {title: "Layer-1 protocols see massive TVL expansion", url:"#"}
    ], sentiment: 0.75 });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/portfolio/:userId', async (req, res) => {
  try {
    let user = await User.findOne({ userId: req.params.userId });
    if (!user) user = await User.create({ userId: req.params.userId, cashBalance: 8350000 });
    res.json(user);
  } catch (err) {
    res.json({ cashBalance: 8350000, holdings: {} });
  }
});

app.post('/api/trade', (req, res) => {
  res.json({ success: true });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));