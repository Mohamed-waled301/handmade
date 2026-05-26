import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useI18n } from '../hooks/useI18n';
import { fmt } from '../utils/formatter';

const Checkout = ({ onSubmitCheckout, setView }) => {
  const { t, lang, dir } = useI18n();
  const {
    cart,
    subT,
    disc,
    delFee,
    gTotal,
    govs,
    selectedGov,
    changeGov
  } = useCart();

  // Local form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addr: '',
    pay: 'cod'
  });

  const [phoneErr, setPhoneErr] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');

  const payMethods = [
    { key: 'cod', lk: 'payCOD', icon: 'fa-solid fa-money-bill-wave' },
    { key: 'card', lk: 'payCARD', icon: 'fa-solid fa-credit-card' },
    { key: 'vodafone', lk: 'payVF', icon: 'fa-solid fa-mobile-screen' },
    { key: 'instapay', lk: 'payIPA', icon: 'fa-solid fa-building-columns' }
  ];

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === 'phone') {
      const ph = val.replace(/\s/g, '');
      setPhoneErr(ph.length > 0 && !/^01[0125]\d{8}$/.test(ph));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationMsg('');

    if (!form.name.trim() || !form.phone.trim() || !form.addr.trim()) {
      setValidationMsg(t('fillAll'));
      return;
    }

    const ph = form.phone.replace(/\s/g, '');
    if (!/^01[0125]\d{8}$/.test(ph)) {
      setPhoneErr(true);
      setValidationMsg(t('phoneErr'));
      return;
    }

    onSubmitCheckout({
      name: form.name,
      phone: ph,
      gov: selectedGov,
      addr: form.addr,
      pay: form.pay
    });
  };

  return (
    <main className="flex-1 py-12 px-6 md:px-12 max-w-6xl mx-auto font-sans" dir={dir}>
      {/* Back Button */}
      <button
        onClick={() => setView('home')}
        className="text-xs font-serif font-bold text-clay-600 dark:text-gold-400 hover:opacity-85 flex items-center gap-1.5 mb-6"
      >
        <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
        {t('backShop')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Form (7 cols) */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-earth-900 dark:text-cream-100">
              {t('chkTitle')}
            </h2>
            <p className="text-xs text-earth-400 dark:text-cream-500 font-serif mt-1">
              Complete your shipment and delivery information.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/40 dark:bg-earth-800/10 border border-warm-200/50 dark:border-earth-700/20 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-bold tracking-widest text-clay-600 dark:text-gold-500 uppercase border-b border-warm-200 dark:border-earth-700 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-user-check text-xs"></i>
              {t('perInfo')}
            </h3>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-earth-600 dark:text-cream-300">{t('fName')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('fNamePh')}
                className="w-full bg-white dark:bg-earth-800 border border-warm-300 dark:border-earth-700 rounded-xl px-4 py-3 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-clay-400 dark:focus:border-gold-500 transition-colors"
                required
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-earth-600 dark:text-cream-300">{t('phone')}</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="01X XXXX XXXX"
                className={`w-full bg-white dark:bg-earth-800 border rounded-xl px-4 py-3 text-sm text-earth-900 dark:text-cream-100 focus:outline-none transition-colors ${
                  phoneErr
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-warm-300 dark:border-earth-700 focus:border-clay-400 dark:focus:border-gold-500'
                }`}
                required
              />
              {phoneErr && (
                <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {t('phoneErr')}
                </p>
              )}
            </div>

            <h3 className="text-sm font-bold tracking-widest text-clay-600 dark:text-gold-500 uppercase border-b border-warm-200 dark:border-earth-700 pb-3 pt-4 flex items-center gap-2">
              <i className="fa-solid fa-truck-fast text-xs"></i>
              {t('shipAddr')}
            </h3>

            {/* Governorate Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-earth-600 dark:text-cream-300">{t('gov')}</label>
              <select
                value={selectedGov}
                onChange={(e) => changeGov(e.target.value)}
                className="w-full bg-white dark:bg-earth-800 border border-warm-300 dark:border-earth-700 rounded-xl px-4 py-3 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-clay-400 dark:focus:border-gold-500 transition-colors cursor-pointer"
              >
                {govs.map((g) => (
                  <option key={g.key} value={g.key}>
                    {t(g.lk)} (+{g.fee} EGP)
                  </option>
                ))}
              </select>
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-earth-600 dark:text-cream-300">{t('addr')}</label>
              <input
                type="text"
                value={form.addr}
                onChange={(e) => handleInputChange('addr', e.target.value)}
                placeholder={t('addrPh')}
                className="w-full bg-white dark:bg-earth-800 border border-warm-300 dark:border-earth-700 rounded-xl px-4 py-3 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-clay-400 dark:focus:border-gold-500 transition-colors"
                required
              />
            </div>

            <h3 className="text-sm font-bold tracking-widest text-clay-600 dark:text-gold-500 uppercase border-b border-warm-200 dark:border-earth-700 pb-3 pt-4 flex items-center gap-2">
              <i className="fa-solid fa-credit-card text-xs"></i>
              {t('payMethod')}
            </h3>

            {/* Payment Methods Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {payMethods.map((m) => (
                <label
                  key={m.key}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                    form.pay === m.key
                      ? 'border-clay-500 dark:border-gold-500 bg-clay-500/5 dark:bg-gold-500/5 shadow-sm'
                      : 'border-warm-200 dark:border-earth-700/50 bg-white/20 dark:bg-earth-800/10 hover:border-warm-300 dark:hover:border-earth-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    value={m.key}
                    checked={form.pay === m.key}
                    onChange={() => handleInputChange('pay', m.key)}
                    className="sr-only"
                  />
                  <i className={`${m.icon} text-lg text-clay-500 dark:text-gold-400 mb-2`}></i>
                  <span className="text-xs font-bold text-earth-800 dark:text-cream-100">{t(m.lk)}</span>
                </label>
              ))}
            </div>

            {/* Validation Warning */}
            {validationMsg && (
              <p className="text-xs text-red-500 font-semibold bg-red-100/30 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 p-3 rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {validationMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-earth-900 dark:bg-cream-100 text-cream-50 dark:text-earth-900 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <i className="fa-solid fa-circle-check text-xs"></i>
              {t('placeOrder')}
            </button>
          </div>
        </form>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-serif font-bold text-earth-900 dark:text-cream-100">
            {t('orderSum')}
          </h3>

          <div className="bg-cream-100/30 dark:bg-earth-800/10 border border-warm-200/40 dark:border-earth-700/20 rounded-2xl p-6 space-y-4">
            {/* Items */}
            <div className="divide-y divide-warm-200/50 dark:divide-earth-700/30 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {cart.map((item) => (
                <div key={item.p.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.p.img}
                    alt={t(item.p.nk)}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-earth-900 dark:text-cream-100 truncate">
                      {t(item.p.nk)}
                    </h4>
                    <p className="text-[10px] text-earth-400 dark:text-cream-500">
                      Qty: {item.qty} × {fmt(item.p.price, lang)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-clay-600 dark:text-gold-400 self-center">
                    {fmt(item.p.price * item.qty, lang)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-warm-200/60 dark:border-earth-700/40 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-earth-400">{t('subtotal')}</span>
                <span className="text-earth-700 dark:text-cream-200">{fmt(subT, lang)}</span>
              </div>
              {disc > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{t('discount')}</span>
                  <span>-{fmt(disc, lang)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-earth-400">{t('insDel')}</span>
                <span className="text-earth-700 dark:text-cream-200">{fmt(delFee, lang)}</span>
              </div>
              <div className="border-t border-warm-200/60 dark:border-earth-700/40 pt-3 flex justify-between text-sm">
                <span className="font-bold text-earth-900 dark:text-cream-100">{t('grand')}</span>
                <span className="text-base font-extrabold text-clay-600 dark:text-gold-400">
                  {fmt(gTotal, lang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
