import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CryptoContext } from '../context/CryptoContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Cpu, TrendingUp, TrendingDown, Clock, Activity, Target, Network } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-gray-800 p-4 shadow-2xl flex flex-col gap-1 min-w-[140px]">
        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold border-b border-gray-800 pb-2 mb-1">
          {label} AI Projection
        </p>
        <p className="text-white font-medium text-2xl pt-1">
          <span className="text-gray-600 text-lg mr-1">₹</span>
          {Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const CoinDetail = () => {
  const { symbol } = useParams();
  const { cryptoData } = useContext(CryptoContext);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const coin = cryptoData[symbol];
  const isPositive = coin?.change >= 0;

  useEffect(() => {
    setLoading(true);
    axios.get(`https://cryptopulse-ml.onrender.com/predict?symbol=${symbol}`)
      .then(res => {
        const formatted = res.data.predictions.map(p => ({
          time: `+${p.hour}h`,
          price: p.predicted_price
        }));
        
        const maxPrice = Math.max(...formatted.map(f => f.price));
        const minPrice = Math.min(...formatted.map(f => f.price));
        
        setPrediction({
          data: formatted,
          signal: res.data.signal,
          confidence: res.data.confidence_percentage,
          base: res.data.current_price_reference,
          targetHigh: maxPrice,
          targetLow: minPrice
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("ML API prediction error:", err);
        setLoading(false);
      });
  }, [symbol]);

  if (!coin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Activity className="animate-pulse mb-4 text-gray-500" size={32} />
        <p className="text-sm font-semibold tracking-widest uppercase">Syncing to Exchange</p>
      </div>
    );
  }

  const getSignalStatus = (sig) => {
    switch(sig) {
      case 'Buy': return { text: 'Accumulate Strategy', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'Sell': return { text: 'Liquidate Strategy', color: 'text-rose-500', bg: 'bg-rose-500/10' };
      default: return { text: 'Hold Position', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24 max-w-[1200px] mx-auto pt-8">
      
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-white font-medium text-xs tracking-wider uppercase mb-10 transition-colors group">
        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Directory Return
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        <div className="lg:col-span-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-800 pb-8 gap-6">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter text-white mb-2">{symbol}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold tracking-wider uppercase">
               <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
               Verified Asset Quote
            </div>
          </div>
          
          <div className="flex gap-8 items-end">
            <div className="flex flex-col text-right">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Index Price</span>
              <span className="text-4xl font-semibold tracking-tight text-white">
                ₹{coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col text-right w-24">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">24h Shift</span>
              <span className={`flex items-center justify-end font-semibold text-lg ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
                {isPositive ? '+' : '-'}{Math.abs(coin.change).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase w-full">LSTM Algorithmic Matrix</h2>
          
          {loading ? (
             <div className="premium-card p-8 flex flex-col items-center justify-center animate-pulse min-h-[300px]">
               <div className="w-8 h-8 rounded-full border-2 border-gray-800 border-t-blue-500 animate-spin mb-4"></div>
               <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Running Inferences</span>
             </div>
          ) : prediction && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-4">
               
               <div className="premium-card p-6">
                 <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">System Recommendation</span>
                 <span className={`text-xl font-bold tracking-tight block ${getSignalStatus(prediction.signal).color} mb-6`}>
                   {getSignalStatus(prediction.signal).text}
                 </span>

                 <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Confidence Interval</span>
                 <div className="w-full bg-gray-900 rounded-full h-1.5 mb-2 overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${prediction.confidence}%` }} transition={{ duration: 1 }} className="bg-blue-500 h-1.5 rounded-full"></motion.div>
                 </div>
                 <div className="flex justify-between text-xs font-medium">
                   <span className="text-gray-400">Precision Threshold</span>
                   <span className="text-white">{prediction.confidence}% Validated</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="premium-card p-5">
                   <Target size={14} className="text-gray-500 mb-3" />
                   <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">24H High Target</span>
                   <span className="text-white text-lg font-semibold">₹{prediction.targetHigh.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
                 <div className="premium-card p-5">
                   <Network size={14} className="text-gray-500 mb-3" />
                   <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Base Retracement</span>
                   <span className="text-white text-lg font-semibold">₹{prediction.targetLow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
               </div>

            </motion.div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-end w-full">
            <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">Forward Looking Trajectory</h2>
            <div className="flex gap-2">
              <button className="text-xs font-semibold px-3 py-1 bg-white text-black rounded">Deep Learner</button>
              <button className="text-xs font-semibold px-3 py-1 text-gray-500 hover:text-white transition-colors">Statistical</button>
            </div>
          </div>

          <div className="premium-card p-6 min-h-[400px] flex flex-col relative overflow-hidden">
             
             {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-secondary)] z-10 transition-opacity"></div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prediction.data} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="proGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0070F3" stopOpacity={0.15}/>
                        <stop offset="90%" stopColor="#0070F3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{fill: '#666', fontSize: 11, fontFamily: 'Inter'}} axisLine={false} tickLine={false} dy={15} />
                    <YAxis domain={['auto', 'auto']} stroke="transparent" tick={{fill: '#666', fontSize: 11, fontFamily: 'Inter'}} dx={-5} width={65} tickFormatter={(val) => `₹${val}`} />
                    <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1}} />
                    <ReferenceLine y={prediction.targetHigh} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                    <Area 
                      type="monotone" dataKey="price" stroke="#0070F3" strokeWidth={2.5}
                      fillOpacity={1} fill="url(#proGradient)" isAnimationActive={true} animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>
        
        {/* Trade Execution Panel */}
        <div className="lg:col-span-12 mt-4">
          <TradePanel symbol={symbol} price={coin.price} />
        </div>

      </div>
    </motion.div>
  );
};

const TradePanel = ({ symbol, price }) => {
  const { userId, refreshPortfolio, portfolio } = useContext(CryptoContext);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('BUY');
  const [status, setStatus] = useState('');

  const executeTrade = async () => {
    if (!amount || isNaN(amount)) return;
    setStatus('Processing...');
    try {
      await axios.post('https://cryptopulse-backend-k5bn.onrender.com/api/trade', {
        userId, symbol, side, amount: parseFloat(amount), price
      });
      setStatus('Order Filled');
      setAmount('');
      refreshPortfolio();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus(err.response?.data?.error || 'Trade Failed');
    }
  };

  const cash = portfolio?.cashBalance || 0;
  const holding = portfolio?.holdings?.[symbol] || 0;

  return (
    <div className="premium-card p-6 border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="w-full md:w-1/3">
         <h3 className="text-sm font-semibold text-white tracking-wider mb-1">Execution Terminal</h3>
         <p className="text-xs text-gray-500 uppercase tracking-widest">Routing via Mock Exchange</p>
      </div>
      
      <div className="flex gap-4 w-full md:w-auto flex-1 justify-center">
        <div className="flex flex-col gap-1 w-1/3">
          <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Action</span>
          <div className="flex bg-black rounded overflow-hidden border border-gray-800">
             <button onClick={() => setSide('BUY')} className={`flex-1 py-2 text-xs font-bold transition-colors ${side === 'BUY' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}>BUY</button>
             <button onClick={() => setSide('SELL')} className={`flex-1 py-2 text-xs font-bold transition-colors ${side === 'SELL' ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'}`}>SELL</button>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-1/3">
          <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Amount ({symbol})</span>
          <input 
             type="number" 
             placeholder="0.00" 
             value={amount} 
             onChange={e => setAmount(e.target.value)} 
             className="w-full bg-black border border-gray-800 text-white text-sm py-2 px-3 rounded focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-3 w-full md:w-1/3 text-sm">
         <div className="flex justify-between border-b border-gray-800 pb-1">
           <span className="text-gray-500">Est. Cost</span>
           <span className="text-white font-mono">
             ₹{amount ? (parseFloat(amount) * price).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
           </span>
         </div>
         <button 
           onClick={executeTrade}
           className={`w-full py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${status === 'Processing...' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : status === 'Order Filled' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(0,112,243,0.5)]' : 'bg-white text-black hover:bg-gray-200'}`}
         >
           {status || 'Submit Order'}
         </button>
         <div className="flex justify-between text-[10px] text-gray-500 font-mono tracking-widest">
           <span>CASH: ₹{cash.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
           <span>HOLDING: {holding.toFixed(4)} {symbol}</span>
         </div>
      </div>
    </div>
  );
};

export default CoinDetail;


