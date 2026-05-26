import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useI18n } from '../hooks/useI18n';
import { fmt } from '../utils/formatter';

const Home = ({ onAddToCart }) => {
  const { t, lang } = useI18n();
  const { products, cats } = useCart();
  
  const [activeCat, setActiveCat] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation angles based on mouse position
    const rx = (y - rect.height / 2) / 25;
    const ry = (rect.width / 2 - x) / 25;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'all 0.1s ease'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'all 0.5s ease'
    });
  };

  // Filter products based on active category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCat === 'all' || p.cat === activeCat;
    const matchesSearch =
      !searchQ.trim() ||
      t(p.nk).toLowerCase().includes(searchQ.toLowerCase()) ||
      t(p.dk).toLowerCase().includes(searchQ.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="flex-1 py-8 md:py-16 font-sans">
      {/* ─── HERO SECTION ─── */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 md:mb-32">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-clay-500/10 dark:bg-gold-500/10 border border-clay-500/25 dark:border-gold-500/25 text-clay-700 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
            <i className="fa-solid fa-sparkles text-[10px]"></i>
            {t('heroBadge')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-earth-900 dark:text-cream-50 leading-[1.1]">
            {t('heroT1')} <br />
            <span className="text-clay-600 dark:text-gold-400 font-normal italic">{t('heroT2')}</span>
          </h2>
          <p className="text-sm md:text-base text-earth-500 dark:text-cream-300 leading-relaxed font-serif max-w-lg">
            {t('heroDesc')}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#collection"
              className="px-6 py-3.5 bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
            >
              {t('shopNow')}
            </a>
            <a
              href="#manifesto"
              className="px-6 py-3.5 border border-warm-300 dark:border-earth-700 text-earth-800 dark:text-cream-200 font-semibold rounded-xl hover:border-clay-400 dark:hover:border-gold-500 transition-colors text-sm bg-white/40 dark:bg-earth-800/20"
            >
              {t('discoverStory')}
            </a>
          </div>
        </div>

        {/* 3D Parallax Card */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-clay-500/20 to-gold-500/20 rounded-[2rem] filter blur-3xl opacity-30 dark:opacity-20 animate-pulse"></div>
          <div
            id="hero-card"
            className="w-full max-w-sm aspect-[4/5] rounded-[2rem] border border-warm-200/50 dark:border-earth-700/50 overflow-hidden shadow-2xl relative bg-cream-100/60 dark:bg-earth-800/20"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
          >
            <img
              src="https://loremflickr.com/800/1000/egyptian,museum/all"
              alt="Artisan Vessel"
              className="w-full h-full object-cover grayscale-[15%] brightness-[95%] dark:grayscale-[5%] dark:brightness-90 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-transparent to-transparent flex flex-col justify-end p-8 text-cream-50">
              <span className="text-[10px] tracking-[0.2em] font-sans font-bold uppercase text-gold-400 mb-1">
                {t('featured')}
              </span>
              <h3 className="text-xl font-serif font-bold tracking-wide">
                {t('p1n')}
              </h3>
              <p className="text-xs text-cream-200/70 font-sans mt-1">
                Matte stoneware from Fayoum pottery district.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEARCH & CATEGORY FILTER ─── */}
      <section id="collection" className="max-w-6xl mx-auto px-6 md:px-12 mb-16 scroll-mt-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-clay-600 dark:text-gold-500">
            {t('catLabel')}
          </span>
          <h3 className="text-3xl font-serif font-bold text-earth-900 dark:text-cream-100 mt-2">
            {t('catTitle')}
          </h3>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-cream-100/40 dark:bg-earth-800/25 border border-warm-200/50 dark:border-earth-700/30 rounded-2xl p-4 mb-8">
          {/* Categories Tab */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto py-1 no-scrollbar">
            {cats.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeCat === c.key
                    ? 'bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 shadow-md'
                    : 'text-earth-500 hover:text-earth-900 dark:text-cream-300 dark:hover:text-white'
                }`}
              >
                {t(c.lk)}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs text-earth-400 dark:text-earth-500"></i>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t('searchPh')}
              className="w-full bg-white dark:bg-earth-800 border border-warm-300 dark:border-earth-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-earth-900 dark:text-cream-100 placeholder:text-earth-400 focus:outline-none focus:border-clay-400 dark:focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-earth-400 font-medium font-serif">{t('noRes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-white/50 dark:bg-earth-800/10 border border-warm-200/50 dark:border-earth-700/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col h-full"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-warm-100 dark:bg-earth-800">
                  <img
                    src={p.img}
                    alt={t(p.nk)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[10%] brightness-[97%] dark:grayscale-[5%]"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest font-sans font-bold uppercase text-clay-500 dark:text-gold-400">
                      {t('cat' + p.cat.charAt(0).toUpperCase() + p.cat.slice(1))}
                    </span>
                    <h4 className="text-base font-serif font-bold text-earth-900 dark:text-cream-100 mt-1">
                      {t(p.nk)}
                    </h4>
                    <p className="text-xs text-earth-400 dark:text-cream-500 mt-2 font-serif leading-relaxed line-clamp-3">
                      {t(p.dk)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-warm-100/50 dark:border-earth-700/15">
                    <span className="text-base font-bold text-clay-600 dark:text-gold-400">
                      {fmt(p.price, lang)}
                    </span>
                    <button
                      onClick={() => onAddToCart(p)}
                      className="px-4 py-2 bg-cream-200 dark:bg-earth-800 text-earth-800 dark:text-cream-200 hover:bg-earth-900 hover:text-cream-50 dark:hover:bg-gold-500 dark:hover:text-earth-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-plus text-[9px]"></i>
                      {t('addBag')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── STORY MANIFESTO ─── */}
      <section id="manifesto" className="bg-warm-100/30 dark:bg-earth-800/10 border-y border-warm-200/50 dark:border-earth-700/20 py-20 px-6 md:px-12 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-clay-600 dark:text-gold-500">
              {t('stLabel')}
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-extrabold text-earth-900 dark:text-cream-100 leading-tight">
              {t('stTitle')}
            </h3>
            <p className="text-sm md:text-base text-earth-500 dark:text-cream-300 font-serif leading-relaxed max-w-xl">
              {t('stDesc')}
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-warm-200 dark:border-earth-700">
              <div>
                <p className="text-2xl md:text-3xl font-serif font-extrabold text-clay-600 dark:text-gold-400">120+</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-earth-400 mt-1">{t('st1')}</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-serif font-extrabold text-clay-600 dark:text-gold-400">100%</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-earth-400 mt-1">{t('st2')}</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-serif font-extrabold text-clay-600 dark:text-gold-400">1.2K</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-earth-400 mt-1">{t('st3')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2.5rem] overflow-hidden aspect-[16/10] shadow-2xl relative">
            <img
              src="https://loremflickr.com/1000/600/craftsman,weaving/all"
              alt="Artisan at work"
              className="w-full h-full object-cover grayscale-[10%] dark:grayscale-[5%]"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
