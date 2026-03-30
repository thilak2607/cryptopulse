import React, { useContext, useEffect, useState } from 'react';
import { CryptoContext } from '../context/CryptoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, Clock, Activity, ArrowRight, Wallet, PieChart } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import AlphaReport from '../components/AlphaReport';

// Master-level Corporate Asset Card
const AssetCard = ({ symbol, data, index }) => {
  const [prediction, setPrediction] = useState(null);
  
  useEffect(() => {
    axios.get(`http://localhost:5001/predict?symbol=${symbol}`)
      .then(res => setPrediction(res.data))
      .catch(() => {});
  }, [symbol]);

  const isPositive = data.change >= 0;

  const getSignalUI = (sig) => {
    switch (sig) {
      case 'Buy': return <span className="bg-success-soft px-3 py-1 rounded-full text-xs font-semibold tracking-wide">Strong Buy</span>;
      case 'Sell': return <span className="bg-danger-soft px-3 py-1 rounded-full text-xs font-semibold tracking-wide">Sell Asset</span>;
      default: return <span className="bg-warning-soft px-3 py-1 rounded-full text-xs font-semibold tracking-wide">Hold Position</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="premium-card p-6 flex flex-col group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">{symbol}</h3>
          <p className="text-gray-400 text-xs tracking-wider uppercase mt-1">Live Feed</p>
        </div>
        {prediction ? getSignalUI(prediction.signal) : <div className="w-16 h-5 bg-white/5 animate-pulse rounded-full"></div>}
      </div>
      
      <div className="flex flex-col gap-1 mb-8">
        <motion.div 
          key={data.price}
          initial={{ color: isPositive ? '#10B981' : '#EF4444' }}
          animate={{ color: '#F3F4F6' }}
          transition={{ duration: 1 }}
          className="text-4xl font-semibold tracking-tight"
        >
          ₹{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.div>
        
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {Math.abs(data.change).toFixed(2)}% (24h)
        </div>
      </div>

      <div className="mt-auto">
        <Link to={`/coin/${symbol}`} className="flex items-center justify-between text-gray-400 font-medium text-sm group-hover:text-white transition-colors">
          <span>View Deep Intelligence</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

const AIRecommendations = ({ cryptoData }) => {
  const [suggestions, setSuggestions] = useState({});
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB'];

  useEffect(() => {
    symbols.forEach(symbol => {
      axios.get(`http://localhost:5001/predict?symbol=${symbol}`)
        .then(res => {
          setSuggestions(prev => ({...prev, [symbol]: res.data}));
        })
        .catch(() => {});
    });
  }, []);

  const getSignalBadge = (sig) => {
    if (sig === 'Buy') return <span className="bg-success-soft px-3 py-1 rounded text-xs font-bold uppercase tracking-widest text-emerald-400">Buy</span>;
    if (sig === 'Sell') return <span className="bg-danger-soft px-3 py-1 rounded text-xs font-bold uppercase tracking-widest text-rose-500">Sell</span>;
    if (sig === 'Hold') return <span className="bg-warning-soft px-3 py-1 rounded text-xs font-bold uppercase tracking-widest text-amber-400">Hold</span>;
    return <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">---</span>;
  };

  return (
    <div className="premium-card p-8 col-span-1 lg:col-span-1 border-gray-800 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8 text-white">
        <Activity size={20} className="text-blue-500" />
        <h2 className="text-sm font-semibold tracking-wider uppercase">Algorithmic Screener</h2>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {symbols.map(symbol => {
           const livePrice = cryptoData[symbol]?.price || 0;
           const target = suggestions[symbol] ? suggestions[symbol].predictions[11].predicted_price : 0;
           return (
             <div key={symbol} className="flex flex-col gap-3 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2">
               
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 shadow-inner">
                     <span className="text-[10px] font-bold text-gray-300">{symbol}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="font-semibold text-white text-sm">{symbol}/INR</span>
                     <span className="text-gray-500 font-mono text-xs">₹{livePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                   </div>
                 </div>
                 
                 <div>
                   {suggestions[symbol] ? getSignalBadge(suggestions[symbol].signal) : getSignalBadge('...')}
                 </div>
               </div>
               
               {suggestions[symbol] && (
                 <div className="flex justify-between pl-11 items-center">
                   <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold border-l-2 border-blue-500/50 pl-2">12H Target</span>
                   <span className={`text-xs font-mono font-medium ${target > livePrice ? 'text-emerald-400' : 'text-rose-500'}`}>
                     ₹{target.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                   </span>
                 </div>
               )}
               
             </div>
           );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { cryptoData, portfolio } = useContext(CryptoContext);
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState(0.5);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/news')
      .then(res => {
        setNews(res.data.articles || []);
        setSentiment(res.data.sentiment || 0.5);
      })
      .catch(err => console.error("News error:", err));
  }, []);

  const symbols = Object.keys(cryptoData);
  const loading = symbols.length === 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 max-w-[1400px] mx-auto z-10 relative mt-8">
      
      <AlphaReport isOpen={reportOpen} onClose={() => setReportOpen(false)} cryptoData={cryptoData} portfolio={portfolio} />

      {/* Refined Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-emerald-500 text-xs font-semibold tracking-wider uppercase">Enterprise Systems Connected</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-2">
            Institutional <span className="text-gray-500 font-normal">Intelligence</span>
          </motion.h1>
          <p className="text-gray-400 max-w-xl text-lg relative group">
             Real-time autonomous models forecasting global asset liquidity.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button className="btn-pro btn-pro-secondary">Historical Data</button>
          <button onClick={() => setReportOpen(true)} className="btn-pro btn-pro-primary">Generate Alpha Report</button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
           <div className="w-8 h-8 rounded-full border-2 border-gray-600 border-t-white animate-spin"></div>
           <p className="text-gray-400 font-mono text-sm tracking-widest">AWAITING WEBSOCKET ESTABLISHMENT...</p>
        </div>
      ) : (
        <div id="portfolio-top" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 scroll-mt-24">
          <AnimatePresence>
            {symbols.map((symbol, idx) => (
              <AssetCard key={symbol} symbol={symbol} data={cryptoData[symbol]} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Main Complex Data Layout */}
      <motion.div 
        id="ml"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 scroll-mt-24"
      >
        <AIRecommendations cryptoData={cryptoData} />
        
        <div className="premium-card p-8 lg:col-span-2 flex flex-col justify-between">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
               <Activity className="text-blue-500" size={20} />
               <h2 className="text-lg font-semibold text-white">Market Liquidity Forecast (BTC)</h2>
             </div>
             <div className="flex gap-2">
               <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-xs font-medium">LSTM Core</span>
             </div>
           </div>
           
           <div className="h-[350px] w-full relative">
             <PriceChart symbol="BTC" height={350} showAxes={true} />
             {/* Professional gradient fade mask to ground the chart */}
             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none opacity-50"></div>
           </div>
        </div>
      </motion.div>
      
      {/* News Layer */}
      <div id="news" className="premium-card p-8 scroll-mt-24 overflow-hidden relative">
         <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
           <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-2">
             <Clock size={16} /> Breaking NLP Analysis
           </h3>
           <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">Live Stream Connected</span>
           </div>
         </div>
         <LiveNewsFeed newsList={news} />
      </div>
    </motion.div>
  );
};

const LiveNewsFeed = ({ newsList }) => {
  const [visibleNews, setVisibleNews] = useState([]);
  const [index, setIndex] = useState(3);

  useEffect(() => {
    if (newsList && newsList.length > 0) {
      setVisibleNews(newsList.slice(0, 3));
    }
  }, [newsList]);

  useEffect(() => {
    if (!newsList || newsList.length <= 3) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIdx = (prevIndex + 1) % newsList.length;
        setVisibleNews((prev) => {
          const newVisible = [...prev];
          newVisible.shift(); // Remove oldest from left
          newVisible.push({ ...newsList[nextIdx], uniqueId: Math.random() }); // Add newest on right
          return newVisible;
        });
        return nextIdx;
      });
    }, 4500); // Swap out every 4.5 seconds
    return () => clearInterval(interval);
  }, [newsList]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {visibleNews.map((item, i) => (
          <motion.a 
            href={item.url || "#"}
            key={item.uniqueId || item.title + i} // Ensure layout shift animations pop correctly
            layout
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.90 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="group flex flex-col gap-2 rounded-xl border border-gray-800 bg-[#0A0A0A] p-5 hover:border-rose-500/50 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
               <span className="text-[10px] text-rose-400 font-bold tracking-widest uppercase flex items-center gap-2">
                 Terminal Inflow
               </span>
               <span className="text-[10px] text-gray-600 font-mono tracking-widest">{new Date().toLocaleTimeString()}</span>
            </div>
            <span className="line-clamp-3 leading-relaxed text-gray-300 group-hover:text-white transition-colors text-sm">{item.title}</span>
          </motion.a>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
