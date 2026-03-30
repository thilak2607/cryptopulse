import React, { useContext } from 'react';
import { CryptoContext } from '../context/CryptoContext';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

const TickerItem = ({ symbol, data }) => {
  const isPositive = data.change >= 0;

  return (
    <motion.div 
      whileHover={{ backgroundColor: 'var(--color-surface-hover)' }}
      className="flex items-center gap-6 px-8 py-2 border-r border-[var(--color-border)] min-w-[240px] shrink-0 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-200 tracking-wide text-sm">{symbol}</span>
      </div>
      <div className="flex flex-col ml-auto text-right">
        <span className="font-mono text-white font-medium text-sm">
          ₹{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`flex items-center text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'} ml-auto`}>
          {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {Math.abs(data.change).toFixed(2)}%
        </span>
      </div>
    </motion.div>
  );
};

const Ticker = () => {
  const { cryptoData } = useContext(CryptoContext);
  const symbols = Object.keys(cryptoData);
  const tickerItems = symbols.length > 0 ? [...symbols, ...symbols, ...symbols, ...symbols] : [];

  return (
    <div className="w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] overflow-hidden flex items-center h-12 relative z-50">
      
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg-secondary)] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-2 px-6 h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] relative z-20 shrink-0 text-xs font-semibold text-gray-400">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Live Market Feed
      </div>

      {tickerItems.length === 0 ? (
        <div className="text-gray-500 px-6 text-sm font-mono animate-pulse">Awaiting WebSocket...</div>
      ) : (
        <motion.div
          className="flex whitespace-nowrap h-full items-center"
          animate={{ x: [0, -240 * (symbols.length * 2)] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: symbols.length * 10,
            ease: "linear"
          }}
          whileHover={{ animationPlayState: "paused" }}
          style={{ width: `${tickerItems.length * 240}px` }}
        >
          {tickerItems.map((symbol, idx) => (
            <TickerItem key={`${symbol}-${idx}`} symbol={symbol} data={cryptoData[symbol]} />
          ))}
        </motion.div>
      )}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg-secondary)] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

export default Ticker;
