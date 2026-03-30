import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-secondary)] border-l-2 border-blue-500 p-3 shadow-lg flex flex-col gap-1">
        <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-white font-medium text-lg leading-none">
          ₹{Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart = ({ symbol, height = 300, showAxes = true }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    axios.get(`https://cryptopulse-ml.onrender.com/predict?symbol=${symbol}`)
      .then(res => {

        console.log("ML DATA:", res.data);

        const formatted = res.data.predictions.map(p => ({
          time: `H${p.hour}`,   // hour label
          price: p.predicted_price
        }));

        setData(formatted);
        setLoading(false);

      })
      .catch(err => {
        console.error("ML error:", err);
        setLoading(false);
      });

  }, [symbol]);

  if (loading) {
    return (
      <div className="w-full h-full bg-[var(--color-surface)] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-2"></div>
        <span className="text-xs uppercase tracking-widest text-gray-500">
          Loading AI Forecast...
        </span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRefined" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0070F3" stopOpacity={0.15}/>
            <stop offset="100%" stopColor="#0070F3" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {showAxes && <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{fill: '#888', fontSize: 11}} />}
        {showAxes && <YAxis domain={['auto', 'auto']} stroke="transparent" tick={{fill: '#888', fontSize: 11}} />}
        {showAxes && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />}

        <Tooltip content={<CustomTooltip />} />

        <Area 
          type="monotone" 
          dataKey="price" 
          stroke="#0070F3" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRefined)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
