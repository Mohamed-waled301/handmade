import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { useCart } from '../hooks/useCart';
import { fmt } from '../utils/formatter';

const Confirm = ({ ordNo, expDate, chk, onContinue }) => {
  const { t, lang, dir } = useI18n();
  const { gTotal } = useCart();

  return (
    <main className="flex-1 py-16 px-6 md:py-24 max-w-2xl mx-auto text-center font-sans" dir={dir}>
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
        <i className="fa-solid fa-circle-check text-4xl"></i>
      </div>

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-earth-900 dark:text-cream-50 leading-tight mb-3">
        {t('orderPlaced')}
      </h2>
      <p className="text-sm text-earth-500 dark:text-cream-300 leading-relaxed font-serif max-w-md mx-auto mb-10">
        {t('orderPlacedCOD')}
      </p>

      {/* Order Info Card */}
      <div className="bg-cream-100/30 dark:bg-earth-800/10 border border-warm-200/40 dark:border-earth-700/20 rounded-2xl p-6 text-left space-y-4 mb-10 max-w-md mx-auto">
        <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
          <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('trackNo')}</span>
          <span className="text-sm font-mono font-bold text-earth-900 dark:text-cream-100">{ordNo}</span>
        </div>
        <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
          <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('amountDue')}</span>
          <span className="text-sm font-bold text-clay-600 dark:text-gold-400">{fmt(gTotal, lang)}</span>
        </div>
        <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
          <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('expDel')}</span>
          <span className="text-sm font-medium text-earth-700 dark:text-cream-200">{expDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('payVia')}</span>
          <span className="text-sm font-semibold text-earth-800 dark:text-cream-100 capitalize flex items-center gap-1.5">
            <i className="fa-solid fa-money-bill-wave text-emerald-500 text-[10px]"></i>
            {t('payOnDelivery')}
          </span>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onContinue}
        className="px-8 py-3.5 bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
      >
        {t('contShop')}
      </button>
    </main>
  );
};

export default Confirm;
