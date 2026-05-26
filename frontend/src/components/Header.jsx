import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useDarkMode } from '../hooks/useDarkMode';
import { useCart } from '../hooks/useCart';

const Header = ({ onCartOpen, setView }) => {
  const { lang, t, toggleLang, dir } = useI18n();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { cartCount } = useCart();
  
  const [annNo, setAnnNo] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnNo((prev) => (prev === 3 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentAnn = annNo === 1 ? 'ann1' : annNo === 2 ? 'ann2' : 'ann3';

  return (
    <header className="w-full relative z-40 select-none" dir={dir}>
      {/* ─── ANNOUNCEMENT BAR ─── */}
      <div className="w-full h-10 bg-warm-200 dark:bg-earth-800 border-b border-warm-300/30 dark:border-earth-700/30 flex items-center justify-center overflow-hidden px-4">
        <p className="text-[10px] md:text-xs tracking-[0.12em] uppercase font-bold text-earth-800 dark:text-cream-300 font-sans transition-all duration-500 text-center">
          {t(currentAnn)}
        </p>
      </div>

      {/* ─── MAIN HEADER ─── */}
      <div className="w-full py-5 md:py-6 px-6 md:px-12 flex justify-between items-center border-b border-warm-200/40 dark:border-earth-700/20 bg-cream-50/80 dark:bg-earth-900/80 backdrop-blur-md sticky top-0 z-30">
        {/* Left Toggles */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLang}
            className="w-10 h-10 rounded-full border border-warm-300/50 dark:border-earth-700/50 text-xs font-bold text-earth-800 dark:text-cream-100 hover:border-clay-400 dark:hover:border-gold-500 flex items-center justify-center transition-all bg-white/40 dark:bg-earth-800/40"
          >
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full border border-warm-300/50 dark:border-earth-700/50 text-sm text-earth-800 dark:text-cream-100 hover:border-clay-400 dark:hover:border-gold-500 flex items-center justify-center transition-all bg-white/40 dark:bg-earth-800/40"
          >
            <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>

        {/* Center Logo */}
        <div className="text-center cursor-pointer" onClick={() => setView('home')}>
          <h1 className="text-2xl md:text-3xl font-serif font-extrabold tracking-[0.25em] text-earth-900 dark:text-cream-50 hover:opacity-90 transition-opacity">
            {t('loading')}
          </h1>
          <p className="text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-clay-500 dark:text-gold-400 font-bold mt-1 font-sans">
            Luxury Egyptian Craftsmanship
          </p>
        </div>

        {/* Right Menu / Bag */}
        <div className="flex items-center gap-5">
          <span className="hidden md:inline text-xs font-serif font-bold text-earth-700 dark:text-cream-200 cursor-pointer hover:text-clay-600 dark:hover:text-gold-400 transition-colors" onClick={() => setView('home')}>
            {t('shop')}
          </span>
          <button
            onClick={onCartOpen}
            className="relative w-11 h-11 rounded-full bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-md shadow-earth-900/10 dark:shadow-black/20"
          >
            <i className="fa-solid fa-bag-shopping text-sm"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-clay-500 dark:bg-gold-500 text-white dark:text-earth-950 text-[9px] font-sans font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-cream-50 dark:border-earth-900 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
