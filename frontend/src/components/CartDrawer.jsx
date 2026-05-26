import React from 'react';
import { useCart } from '../hooks/useCart';
import { useI18n } from '../hooks/useI18n';
import { fmt } from '../utils/formatter';

const CartDrawer = ({ visible, onClose, setView }) => {
  const { t, lang, dir } = useI18n();
  const {
    cart,
    cartCount,
    subT,
    disc,
    delFee,
    gTotal,
    promo,
    setPromo,
    promoOk,
    promoMsg,
    addCart,
    remCart,
    updQty,
    applyPromo
  } = useCart();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" dir={dir}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-earth-900/30 dark:bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer Container */}
      <div
        className={`absolute top-0 bottom-0 w-full max-w-md gls bg-cream-50/95 dark:bg-earth-900/95 shadow-2xl flex flex-col transition-transform duration-300 ${
          lang === 'ar'
            ? 'left-0 border-r border-warm-200/40 dark:border-earth-700/40 animate-slide-in-left'
            : 'right-0 border-l border-warm-200/40 dark:border-earth-700/40 animate-slide-in-right'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-warm-200/60 dark:border-earth-700/40">
          <h2 className="text-lg font-serif font-bold text-earth-900 dark:text-cream-100 flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping text-clay-500 dark:text-gold-400"></i>
            <span>{t('yourBag')}</span>
            <span className="text-sm font-sans font-normal text-earth-400">({cartCount})</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-warm-300 dark:border-earth-600 flex items-center justify-center text-earth-400 hover:text-clay-600 dark:hover:text-gold-400 transition-all"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Items Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-warm-200/50 dark:bg-earth-700/40 flex items-center justify-center mb-4">
                <i className="fa-solid fa-bag-shopping text-3xl text-warm-400 dark:text-earth-500"></i>
              </div>
              <p className="text-earth-500 dark:text-cream-400 font-medium mb-1">{t('emptyBag')}</p>
              <p className="text-earth-400 dark:text-earth-500 text-sm">{t('emptyBagD')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={item.p.id}
                  className="flex gap-3 p-3 rounded-xl bg-white/70 dark:bg-earth-800/40 border border-warm-200/40 dark:border-earth-700/30"
                >
                  <img
                    src={item.p.img}
                    alt={t(item.p.nk)}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-earth-900 dark:text-cream-100 truncate">
                        {t(item.p.nk)}
                      </h4>
                      <button
                        onClick={() => remCart(idx)}
                        className="text-earth-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                    <p className="text-xs text-earth-400 dark:text-cream-500 truncate">{t(item.p.dk)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updQty(idx, -1)}
                          className="qb w-7 h-7 rounded-lg bg-cream-200 dark:bg-earth-700 text-earth-600 dark:text-cream-300 hover:bg-clay-100 dark:hover:bg-gold-500/20 flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-earth-700 dark:text-cream-200">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updQty(idx, 1)}
                          className="qb w-7 h-7 rounded-lg bg-cream-200 dark:bg-earth-700 text-earth-600 dark:text-cream-300 hover:bg-clay-100 dark:hover:bg-gold-500/20 flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                      <span className="text-sm font-bold text-clay-600 dark:text-gold-400">
                        {fmt(item.p.price * item.qty, lang)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Container */}
        {cart.length > 0 && (
          <div className="border-t border-warm-200/60 dark:border-earth-700/40 p-6 space-y-4">
            {/* Promo Code Input */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder={t('promoPh')}
                  className="flex-1 bg-white dark:bg-earth-800 border border-warm-300 dark:border-earth-600 rounded-xl px-4 py-2 text-sm text-earth-900 dark:text-cream-100 placeholder:text-earth-300 dark:placeholder:text-earth-500 focus:outline-none focus:border-clay-400 dark:focus:border-gold-500 transition-colors"
                  dir="ltr"
                />
                <button
                  onClick={() => applyPromo(lang, t)}
                  className="px-4 py-2 bg-cream-200 dark:bg-earth-700 text-earth-700 dark:text-cream-200 hover:bg-earth-900 hover:text-cream-50 dark:hover:bg-gold-500 dark:hover:text-earth-900 rounded-xl text-sm font-medium transition-colors"
                >
                  {t('apply')}
                </button>
              </div>
              {promoMsg && (
                <p
                  className={`text-xs mt-1.5 flex items-center gap-1 ${
                    promoOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}
                >
                  <i className={`fa-solid ${promoOk ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                  <span>{promoMsg}</span>
                </p>
              )}
            </div>

            {/* Totals Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-earth-400">{t('subtotal')}</span>
                <span className="text-earth-700 dark:text-cream-200">{fmt(subT, lang)}</span>
              </div>
              {disc > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">{t('discount')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">-{fmt(disc, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-earth-400">{t('insDel')}</span>
                <span className="text-earth-700 dark:text-cream-200">{fmt(delFee, lang)}</span>
              </div>
              <div className="border-t border-warm-200/60 dark:border-earth-700/40 pt-2 flex justify-between">
                <span className="font-semibold text-earth-900 dark:text-cream-100">{t('grand')}</span>
                <span className="text-lg font-bold text-clay-600 dark:text-gold-400">{fmt(gTotal, lang)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => {
                onClose();
                setView('checkout');
              }}
              className="w-full py-3 bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-lock text-sm"></i>
              <span>{t('checkout')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
