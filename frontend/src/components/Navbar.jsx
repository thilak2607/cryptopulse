import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Command, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (e, path, sectionId) => {
    e.preventDefault();
    if (location.pathname === path) {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(path);
      if (sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  return (
    <nav className="w-full bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border)] py-4 px-6 md:px-10 z-40 sticky top-0 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        
        <Link to="/" onClick={(e) => handleNav(e, '/', null)} className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded drop-shadow bg-gradient-to-tr from-gray-800 to-gray-500 flex items-center justify-center p-[1px]"
          >
             <div className="w-full h-full bg-black rounded-sm flex items-center justify-center">
                <Command className="text-gray-300" size={16} strokeWidth={2.5} />
             </div>
          </motion.div>
          <span className="text-xl font-semibold tracking-tight text-white flex gap-1">
            CryptoPulse <span className="text-gray-600 font-normal">Terminal</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="/" onClick={(e) => handleNav(e, '/', null)} className="hover:text-white transition-colors cursor-pointer">Markets</a>
          <a href="/#portfolio" onClick={(e) => handleNav(e, '/', 'portfolio-top')} className="hover:text-white transition-colors cursor-pointer">Portfolio</a>
          <a href="/#ml" onClick={(e) => handleNav(e, '/', 'ml')} className="hover:text-white transition-colors cursor-pointer">Machine Learning</a>
          <a href="/#news" onClick={(e) => handleNav(e, '/', 'news')} className="hover:text-white transition-colors cursor-pointer">News Feed</a>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex text-gray-400 hover:text-white transition-colors">
            <BarChart2 size={18} />
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
