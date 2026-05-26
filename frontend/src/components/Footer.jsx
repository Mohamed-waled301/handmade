import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';

const Footer = ({ onAdminTrigger }) => {
  const { t, dir } = useI18n();
  const [clicks, setClicks] = useState(0);

  const handleCopyrightClick = () => {
    const nextClicks = clicks + 1;
    if (nextClicks >= 5) {
      setClicks(0);
      onAdminTrigger();
    } else {
      setClicks(nextClicks);
    }
  };

  return (
    <footer className="bg-earth-900 text-cream-200 py-16 px-6 md:px-12 border-t border-earth-800" dir={dir}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-[0.2em] text-cream-50 uppercase mb-4">
            {t('loading')}
          </h2>
          <p className="text-xs text-earth-400 font-serif leading-relaxed max-w-sm mx-auto md:mx-0">
            {t('heroDesc')}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-cream-100 uppercase mb-4">
            {t('ourStory')}
          </h3>
          <p className="text-xs text-earth-400 leading-relaxed max-w-sm mx-auto md:mx-0">
            {t('stDesc')}
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end justify-center">
          <div className="flex gap-4 mb-6">
            <a href="#" className="w-9 h-9 rounded-full border border-earth-700 flex items-center justify-center text-earth-400 hover:text-gold-400 hover:border-gold-500 transition-colors">
              <i className="fa-brands fa-instagram text-sm"></i>
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-earth-700 flex items-center justify-center text-earth-400 hover:text-gold-400 hover:border-gold-500 transition-colors">
              <i className="fa-brands fa-pinterest text-sm"></i>
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-earth-700 flex items-center justify-center text-earth-400 hover:text-gold-400 hover:border-gold-500 transition-colors">
              <i className="fa-solid fa-envelope text-sm"></i>
            </a>
          </div>
          <p className="text-[10px] text-earth-500 uppercase tracking-widest font-semibold font-sans">
            Museum Quality • 100% Insured
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-earth-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p 
          className="text-xs text-earth-500 select-none cursor-pointer"
          onClick={handleCopyrightClick}
        >
          © {new Date().getFullYear()} {t('loading')}. {t('rights')}
        </p>
        <div className="flex gap-6 text-[10px] text-earth-500 uppercase tracking-wider font-semibold">
          <a href="#" className="hover:text-cream-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cream-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-cream-400 transition-colors">Artisan Registry</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
