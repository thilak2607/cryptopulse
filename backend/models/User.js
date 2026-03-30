const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  cashBalance: { type: Number, default: 8350000.00 }, // Start with 83.5L INR paper trading money
  holdings: {
    type: Map,
    of: Number,
    default: {
      BTC: 0,
      ETH: 0,
      SOL: 0,
      BNB: 0
    }
  },
  tradeHistory: [{
    symbol: String,
    type: { type: String, enum: ['BUY', 'SELL'] },
    amount: Number,
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('User', UserSchema);
