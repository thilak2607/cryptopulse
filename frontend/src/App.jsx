import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import CoinDetail from './pages/CoinDetail';
import Navbar from './components/Navbar';
import Ticker from './components/Ticker';
import ThreeBackground from './components/ThreeBackground';
import { CryptoContext } from './context/CryptoContext';

function App() {
  const [cryptoData, setCryptoData] = useState({});
  const [socket, setSocket] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const userId = 'mock-trader-01';

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`https://cryptopulse-backend-k5bn.onrender.com/api/portfolio/${userId}`);
      setPortfolio(res.data);
    } catch (err) {
      console.error("Failed to fetch portfolio", err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    
    // Connect to backend server
    const newSocket = io('https://cryptopulse-backend-k5bn.onrender.com');
    setSocket(newSocket);

    newSocket.on('initial-data', (data) => {
      setCryptoData(data);
    });

    newSocket.on('price-update', ({ symbol, price, timestamp }) => {
      const inrPrice = price * 83.5; // Convert USD to INR
      setCryptoData((prev) => {
        const coinData = prev[symbol] || { price: 0, change: 0, history: [] };
        const oldPrice = coinData.price || inrPrice;
        const change = oldPrice !== 0 ? ((inrPrice - oldPrice) / oldPrice) * 100 : 0;
        
        return {
          ...prev,
          [symbol]: {
            ...coinData,
            price: inrPrice,
            change: change !== 0 ? change : coinData.change,
            lastUpdated: timestamp
          }
        };
      });
    });

    return () => newSocket.close();
  }, []);

  return (
    <CryptoContext.Provider value={{ cryptoData, socket, portfolio, refreshPortfolio: fetchPortfolio, userId }}>
      <Router>
        <div className="relative min-h-screen z-0 overflow-x-hidden text-white font-sans bg-[var(--color-bg-primary)]">
          {/* Subtle Abstract Background */}
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <ThreeBackground />
          </div>
          
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <Ticker />
            
            <main className="flex-grow w-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/coin/:symbol" element={<CoinDetail />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </CryptoContext.Provider>
  );
}

export default App;