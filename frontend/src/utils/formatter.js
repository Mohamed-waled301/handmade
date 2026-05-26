export const fmt = (amount, lang) => {
  const f = amount.toLocaleString('en-US');
  return lang === 'ar' ? f + ' ج.م' : 'EGP ' + f;
};

export const formatDate = (dateStr, lang) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
