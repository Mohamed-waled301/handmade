import React, { useEffect } from 'react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast?.visible) return null;

  const { message, type = 'success' } = toast;

  let borderClass = 'border-warm-200 dark:border-earth-700';
  let iconClass = 'bg-sage-100 dark:bg-gold-500/15 text-sage-600 dark:text-gold-400';
  let icon = 'fa-check';

  if (type === 'error') {
    borderClass = 'border-red-200 dark:border-red-900/50';
    iconClass = 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400';
    icon = 'fa-xmark';
  } else if (type === 'warning') {
    borderClass = 'border-amber-200 dark:border-amber-900/50';
    iconClass = 'bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400';
    icon = 'fa-exclamation';
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] max-w-sm bg-white/90 dark:bg-earth-800/90 border rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${borderClass}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <p className="text-sm text-earth-700 dark:text-cream-200 font-sans">{message}</p>
    </div>
  );
};

export default Toast;
