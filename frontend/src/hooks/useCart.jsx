import React, { createContext, useContext, useState, useEffect } from 'react';

const products = [
  { id: 1, nk: 'p1n', dk: 'p1d', ck: 'catCeramics', cat: 'ceramics', price: 3200, img: 'https://loremflickr.com/600/600/pottery,vase/all' },
  { id: 2, nk: 'p2n', dk: 'p2d', ck: 'catRugs', cat: 'rugs', price: 18500, img: 'https://loremflickr.com/600/600/carpet,rug/all' },
  { id: 3, nk: 'p3n', dk: 'p3d', ck: 'catTableware', cat: 'tableware', price: 4600, img: 'https://loremflickr.com/600/600/ceramic,plate/all' },
  { id: 4, nk: 'p4n', dk: 'p4d', ck: 'catTextiles', cat: 'textiles', price: 7200, img: 'https://loremflickr.com/600/600/kilim,weaving/all' },
  { id: 5, nk: 'p5n', dk: 'p5d', ck: 'catWoodwork', cat: 'woodwork', price: 5800, img: 'https://loremflickr.com/600/600/woodcarving,box/all' },
  { id: 6, nk: 'p6n', dk: 'p6d', ck: 'catGlassware', cat: 'glassware', price: 3900, img: 'https://loremflickr.com/600/600/blown-glass,lamp/all' }
];

const cats = [
  { key: 'all', lk: 'catAll' },
  { key: 'ceramics', lk: 'catCeramics' },
  { key: 'rugs', lk: 'catRugs' },
  { key: 'tableware', lk: 'catTableware' },
  { key: 'textiles', lk: 'catTextiles' },
  { key: 'woodwork', lk: 'catWoodwork' },
  { key: 'glassware', lk: 'catGlassware' }
];

const govs = [
  { key: 'cairo', lk: 'gCairo', fee: 45, days: 2 },
  { key: 'giza', lk: 'gGiza', fee: 45, days: 2 },
  { key: 'alex', lk: 'gAlex', fee: 75, days: 3 },
  { key: 'delta', lk: 'gDelta', fee: 85, days: 4 },
  { key: 'upper', lk: 'gUpper', fee: 110, days: 5 }
];

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [promo, setPromo] = useState('');
  const [promoOk, setPromoOk] = useState(false);
  const [promoMsg, setPromoMsg] = useState('');
  const [selectedGov, setSelectedGov] = useState('cairo');
  const [delFee, setDelFee] = useState(45);

  const addCart = (p, toastCallback) => {
    setCart((prev) => {
      const existing = prev.find(item => item.p.id === p.id);
      if (existing) {
        return prev.map(item => item.p.id === p.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { p, qty: 1 }];
      }
    });
    if (toastCallback) toastCallback();
  };

  const remCart = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const updQty = (idx, delta) => {
    setCart((prev) => {
      const updated = prev.map((item, i) => {
        if (i === idx) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty };
        }
        return item;
      });
      return updated.filter(item => item.qty > 0);
    });
  };

  const applyPromo = (lang, t) => {
    if (promo.trim().toUpperCase() === 'EGYPT2026') {
      setPromoOk(true);
      setPromoMsg(t('promoOk'));
    } else {
      setPromoOk(false);
      setPromoMsg(t('promoFail'));
    }
  };

  const changeGov = (govKey) => {
    setSelectedGov(govKey);
    const g = govs.find(x => x.key === govKey);
    setDelFee(g ? g.fee : 45);
  };

  const resetCart = () => {
    setCart([]);
    setPromo('');
    setPromoOk(false);
    setPromoMsg('');
    setSelectedGov('cairo');
    setDelFee(45);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subT = cart.reduce((sum, item) => sum + item.p.price * item.qty, 0);
  const disc = promoOk ? Math.round(subT * 0.1) : 0;
  const gTotal = subT - disc + delFee;

  return (
    <CartContext.Provider value={{
      products, cats, govs, cart, cartCount, subT, disc, delFee, gTotal,
      promo, setPromo, promoOk, promoMsg, selectedGov,
      addCart, remCart, updQty, applyPromo, changeGov, resetCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
