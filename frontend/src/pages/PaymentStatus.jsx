import React, { useEffect, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useCart } from '../hooks/useCart';
import { fetchOrderStatus } from '../services/paymobService';
import { fmt } from '../utils/formatter';

const PaymentStatus = ({ ordNo, expDate, chk, onContinue, onRetryCheckout }) => {
  const { t, lang, dir } = useI18n();
  const { gTotal } = useCart();
  
  const [status, setStatus] = useState('PENDING'); // 'PENDING' | 'PAID' | 'FAILED'
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let intervalId;
    let attempts = 0;

    const pollStatus = async () => {
      attempts++;
      try {
        const data = await fetchOrderStatus(ordNo);
        if (data.status === 'PAID') {
          setStatus('PAID');
          setTransactionDetails(data);
          clearInterval(intervalId);
        } else if (data.status === 'FAILED') {
          setStatus('FAILED');
          setTransactionDetails(data);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      // Safeguard: Stop polling after 40 attempts (~100 seconds)
      if (attempts >= 40) {
        setStatus('FAILED');
        setErrorMsg('Verification timeout. Webhook was not received.');
        clearInterval(intervalId);
      }
    };

    // Poll every 2.5 seconds
    intervalId = setInterval(pollStatus, 2500);

    // Initial check immediately
    pollStatus();

    return () => clearInterval(intervalId);
  }, [ordNo]);

  return (
    <main className="flex-1 py-12 px-6 md:py-24 max-w-2xl mx-auto text-center font-sans" dir={dir}>
      
      {/* ─── POLLING / PENDING VIEW ─── */}
      {status === 'PENDING' && (
        <div className="space-y-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-clay-500/10 dark:bg-gold-500/10 text-clay-600 dark:text-gold-400 flex items-center justify-center mx-auto shadow-md animate-spin-slow">
            <i className="fa-solid fa-arrows-spin text-4xl"></i>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-earth-900 dark:text-cream-50 leading-tight">
              {t('payStatusDesc')}
            </h2>
            <p className="text-sm text-earth-400 dark:text-cream-500 leading-relaxed font-serif max-w-sm mx-auto">
              {t('verifyingPayment')}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-clay-600 dark:text-gold-400">
            <i className="fa-solid fa-circle-notch animate-spin text-[10px]"></i>
            <span>{t('statusPending')}</span>
          </div>
        </div>
      )}

      {/* ─── SUCCESS / PAID VIEW ─── */}
      {status === 'PAID' && (
        <div className="space-y-10 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <i className="fa-solid fa-shield-check text-4xl"></i>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-earth-900 dark:text-cream-50 leading-tight">
              {t('orderOk')}
            </h2>
            <p className="text-sm text-earth-500 dark:text-cream-300 leading-relaxed font-serif max-w-md mx-auto">
              {t('orderOkD')}
            </p>
          </div>

          {/* Secure Receipt Breakdown Card */}
          <div className="bg-cream-100/30 dark:bg-earth-800/10 border border-warm-200/40 dark:border-earth-700/20 rounded-2xl p-6 text-left space-y-4 mb-6 max-w-md mx-auto">
            <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
              <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('trackNo')}</span>
              <span className="text-sm font-mono font-bold text-earth-900 dark:text-cream-100">{ordNo}</span>
            </div>
            <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
              <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('txId')}</span>
              <span className="text-sm font-mono font-bold text-earth-800 dark:text-cream-200">
                {transactionDetails?.transactionId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
              <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('totalPaid')}</span>
              <span className="text-sm font-bold text-clay-600 dark:text-gold-400">
                {fmt(transactionDetails?.amount || gTotal, lang)}
              </span>
            </div>
            <div className="flex justify-between border-b border-warm-200/40 dark:border-earth-700/15 pb-3">
              <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('expDel')}</span>
              <span className="text-sm font-medium text-earth-700 dark:text-cream-200">{expDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-earth-400 font-bold uppercase tracking-wider">{t('payVia')}</span>
              <span className="text-sm font-semibold text-earth-800 dark:text-cream-100 capitalize">
                {transactionDetails?.paymentMethod || (t('pay_' + chk?.pay) || chk?.pay)}
              </span>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="px-8 py-3.5 bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
          >
            {t('contShop')}
          </button>
        </div>
      )}

      {/* ─── FAILURE / FAILED VIEW ─── */}
      {status === 'FAILED' && (
        <div className="space-y-8 animate-shake">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
            <i className="fa-solid fa-circle-xmark text-4xl animate-pulse"></i>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-earth-900 dark:text-cream-50 leading-tight">
              {t('payFailedTitle')}
            </h2>
            <p className="text-sm text-earth-500 dark:text-cream-300 leading-relaxed font-serif max-w-md mx-auto">
              {errorMsg || t('payFailedDesc')}
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={onRetryCheckout}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
            >
              {t('retryPayment')}
            </button>
            <button
              onClick={onContinue}
              className="px-8 py-3.5 border border-warm-300 dark:border-earth-700 text-earth-800 dark:text-cream-200 font-semibold rounded-xl hover:border-clay-400 dark:hover:border-gold-500 transition-colors text-sm bg-white/40 dark:bg-earth-800/20"
            >
              {t('retHome')}
            </button>
          </div>
        </div>
      )}

    </main>
  );
};

export default PaymentStatus;
