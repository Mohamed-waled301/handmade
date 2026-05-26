import React from 'react';
import { useI18n } from '../hooks/useI18n';

const ConfirmDialog = ({
  visible,
  type = 'markPaid', // 'markPaid' | 'reject' | 'unlock'
  rejectReasonInput,
  setRejectReasonInput,
  adminPassInput,
  setAdminPassInput,
  onConfirm,
  onCancel
}) => {
  const { t, dir } = useI18n();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={dir}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-earth-900/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-sm gls bg-cream-50/95 dark:bg-earth-900/95 border border-warm-200/60 dark:border-earth-700/40 rounded-2xl p-6 shadow-2xl z-10">
        {type === 'markPaid' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-circle-check text-2xl text-emerald-500"></i>
            </div>
            <h3 className="text-lg font-serif font-bold text-earth-900 dark:text-cream-100 text-center mb-2">
              {t('confirmMarkPaidTitle')}
            </h3>
            <p className="text-sm text-earth-500 dark:text-cream-400 text-center mb-6">
              {t('confirmMarkPaidMsg')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 border border-warm-300 dark:border-earth-600 text-earth-600 dark:text-cream-300 font-medium rounded-xl hover:border-clay-400 dark:hover:border-gold-500 transition-colors text-sm"
              >
                {t('confirmCancel')}
              </button>
              <button
                onClick={() => onConfirm()}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {t('confirmMarkPaidBtn')}
              </button>
            </div>
          </>
        )}

        {type === 'reject' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-circle-xmark text-2xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-serif font-bold text-earth-900 dark:text-cream-100 text-center mb-2">
              {t('confirmRejectTitle')}
            </h3>
            <p className="text-sm text-earth-500 dark:text-cream-400 text-center mb-4">
              {t('confirmRejectMsg')}
            </p>
            <textarea
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder={t('rejectReasonPh')}
              rows={3}
              className="w-full bg-cream-100/60 dark:bg-earth-700/40 border border-warm-300 dark:border-earth-600 rounded-xl px-4 py-3 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-red-400 transition-colors resize-none mb-4"
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 border border-warm-300 dark:border-earth-600 text-earth-600 dark:text-cream-300 font-medium rounded-xl hover:border-clay-400 dark:hover:border-gold-500 transition-colors text-sm"
              >
                {t('confirmCancel')}
              </button>
              <button
                onClick={() => onConfirm(rejectReasonInput)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {t('confirmRejectBtn')}
              </button>
            </div>
          </>
        )}

        {type === 'unlock' && (
          <>
            <div className="w-12 h-12 rounded-full bg-clay-100 dark:bg-gold-500/15 flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-lock text-2xl text-clay-500 dark:text-gold-400"></i>
            </div>
            <h3 className="text-lg font-serif font-bold text-earth-900 dark:text-cream-100 text-center mb-2">
              {t('unlockAdminTitle')}
            </h3>
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder={t('adminPassPh')}
              className="w-full bg-cream-100/60 dark:bg-earth-700/40 border border-warm-300 dark:border-earth-600 rounded-xl px-4 py-2.5 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-clay-400 dark:focus:border-gold-500 transition-colors mb-4 text-center font-mono tracking-widest"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm(adminPassInput);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 border border-warm-300 dark:border-earth-600 text-earth-600 dark:text-cream-300 font-medium rounded-xl hover:border-clay-400 dark:hover:border-gold-500 transition-colors text-sm"
              >
                {t('confirmCancel')}
              </button>
              <button
                onClick={() => onConfirm(adminPassInput)}
                className="flex-1 py-2.5 bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 font-semibold rounded-xl hover:shadow-lg transition-all text-sm"
              >
                {t('unlockBtn')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmDialog;
