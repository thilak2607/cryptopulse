import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, Activity, Network, ShieldCheck, X } from 'lucide-react';

const AlphaReport = ({ isOpen, onClose, cryptoData, portfolio }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }
    
    // Simulate complex systemic sequence
    const sequence = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3000),
      setTimeout(() => setStep(3), 4500),
      setTimeout(() => setStep(4), 6000),
    ];
    
    return () => sequence.forEach(clearTimeout);
  }, [isOpen]);

  const btcPrice = cryptoData.BTC?.price || 60000;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0, transition: { delay: 0.2 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
        >
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl" onClick={onClose} />
          
          <motion.div 
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-[#0A0A0A] border border-[var(--color-border)] shadow-[0_30px_100px_rgba(0,0,0,0.8)] w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden relative z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                 <Terminal size={20} className="text-blue-500" />
                 <h2 className="text-white font-bold tracking-tight text-xl">Macro Alpha Synthesis</h2>
                 <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Confidential</span>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Sequence Engine */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col relative hide-scrollbar">
              
              <div className="w-full flex justify-between mb-10 pb-6 border-b border-gray-800">
                <StepIndicator current={step} target={0} icon={<BrainCircuit size={16}/>} label="Neural Parsing" />
                <StepIndicator current={step} target={1} icon={<Activity size={16}/>} label="On-Chain Scrape" />
                <StepIndicator current={step} target={2} icon={<Network size={16}/>} label="Sentiment Index" />
                <StepIndicator current={step} target={3} icon={<ShieldCheck size={16}/>} label="Strategy Formulation" />
              </div>

              {step < 4 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                   <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ ease: "linear", duration: 8, repeat: Infinity }}
                      className="w-24 h-24 border border-gray-800 border-t-blue-500 rounded-full mb-8 relative"
                   >
                      <div className="absolute inset-2 border border-gray-800 border-b-purple-500 rounded-full animate-spin-slow" />
                      <div className="absolute inset-4 border border-gray-800 border-l-emerald-500 rounded-full animate-spin" style={{animationDirection: "reverse"}} />
                   </motion.div>
                   <p className="text-gray-400 font-mono tracking-widest uppercase text-sm animate-pulse">
                     {step === 0 && "Initializing LSTM Architecture..."}
                     {step === 1 && "Verifying Block Heuristics..."}
                     {step === 2 && "Computing NLP Vectors..."}
                     {step === 3 && "Aggregating Signal Synthesis..."}
                   </p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <ReportCard title="Market Regime" value="Expansionary Phase" highlight="text-emerald-400" desc="Capital inflow increasing across top 5 layer-1 protocols." />
                     <ReportCard title="Global Sentiment" value="78.4 (Greed)" highlight="text-amber-400" desc="Retail accumulation detected. Institutional basis compressing." />
                     <ReportCard title="Liquidity Depth" value="₹350B Imbalance" highlight="text-blue-400" desc="Strong bid support identified at the low range boundaries." />
                   </div>
                   
                   <div className="bg-[#111111] border border-gray-800 rounded-xl p-8 mt-4">
                     <h3 className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-6">Execution Strategy (BTC)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div>
                         <div className="flex justify-between items-center mb-4">
                           <span className="text-white font-medium">Optimal Entry Zone</span>
                           <span className="text-emerald-400 font-mono">₹{(btcPrice * 0.98).toFixed(2)} - ₹{(btcPrice * 0.995).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center mb-4">
                           <span className="text-white font-medium">Validation Invalidation</span>
                           <span className="text-rose-500 font-mono">₹{(btcPrice * 0.95).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-white font-medium">Macro Target (14D)</span>
                           <span className="text-blue-400 font-mono">₹{(btcPrice * 1.08).toFixed(2)}</span>
                         </div>
                       </div>
                       
                       <div className="border-l border-gray-800 pl-8">
                         <p className="text-gray-400 leading-relaxed text-sm">
                           The aggregated algorithmic matrix signals a high probability of mean reversion toward the upper standard deviation band. Based on current systemic holdings of <strong className="text-white">₹{portfolio?.cashBalance?.toLocaleString()}</strong> in liquid cash, capital deployment of 15% is recommended to capture alpha during the upcoming volatile contraction.
                         </p>
                       </div>
                     </div>
                   </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StepIndicator = ({ current, target, icon, label }) => {
  const isActive = current >= target;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-blue-500/20 text-blue-500 border-2 border-blue-500' : 'bg-gray-900 border border-gray-800 text-gray-700'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-700'}`}>{label}</span>
    </div>
  );
};

const ReportCard = ({ title, value, desc, highlight }) => (
  <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
     <h4 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{title}</h4>
     <p className={`text-xl font-bold tracking-tight mb-3 ${highlight}`}>{value}</p>
     <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default AlphaReport;
