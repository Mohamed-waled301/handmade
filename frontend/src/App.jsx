import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Confirm from './pages/Confirm';
import PaymentStatus from './pages/PaymentStatus';

import { useCart, CartProvider } from './hooks/useCart';
import { useI18n, I18nProvider } from './hooks/useI18n';
import { useDarkMode, DarkModeProvider } from './hooks/useDarkMode';
import { createOrder, createPaymobHostedPayment } from './services/paymobService';

const AppContent = () => {
  const { t, lang, dir } = useI18n();
  const { cart, gTotal, promo, promoOk, selectedGov, resetCart, addCart } = useCart();

  // Core App states
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Checkout states
  const [ordNo, setOrdNo] = useState('');
  const [expDate, setExpDate] = useState('');
  const [chk, setChk] = useState(null);

  // Fade out loader on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Detect Paymob redirect callback parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const merchantOrderId = params.get('merchant_order_id');
    const orderId = params.get('order') || merchantOrderId;

    if (orderId && success !== null) {
      setOrdNo(orderId);

      // Compute expected delivery date
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setExpDate(
        d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );

      // Route directly to payment-status where polling queries the true webhook status!
      setView('payment-status');

      // Clear the query parameters from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [lang]);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const handleCheckoutSubmit = async (formDetails) => {
    setChk(formDetails);
    setLoading(true);

    try {
      // Map payment method to server format
      let payMethod = 'cod';
      if (formDetails.pay === 'card') payMethod = 'CARD';
      else if (formDetails.pay === 'vodafone') payMethod = 'WALLET';
      else if (formDetails.pay === 'instapay') payMethod = 'INSTAPAY';

      // Step 1: Create order on server (server computes amount from product catalog)
      const cartItems = cart.map(item => ({
        productId: item.p.id,
        quantity: item.qty
      }));

      const orderData = await createOrder({
        items: cartItems,
        customerName: formDetails.name,
        customerPhone: formDetails.phone,
        customerAddress: formDetails.addr,
        governorate: selectedGov,
        promoCode: promoOk ? promo : '',
        paymentMethod: payMethod
      });

      const orderNumber = orderData.orderId;
      setOrdNo(orderNumber);

      // Calculate expected delivery date
      const d = new Date();
      const govSpeed = formDetails.gov === 'cairo' || formDetails.gov === 'giza' ? 2 : 3;
      d.setDate(d.getDate() + govSpeed);
      const expected = d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setExpDate(expected);

      if (formDetails.pay === 'cod') {
        // COD — order already created on server with COD_CONFIRMED status
        setLoading(false);
        setView('confirm');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Step 2: Create hosted payment (server uses stored amount — no amount sent)
        const paymentData = await createPaymobHostedPayment({
          orderId: orderNumber
        });

        setLoading(false);
        if (paymentData.redirect_url) {
          showToast(t('securingRedirect'), 'success');
          setTimeout(() => {
            window.location.href = paymentData.redirect_url;
          }, 800);
        } else {
          showToast(t('serverError'), 'error');
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      showToast(err.message || t('serverError'), 'error');
    }
  };

  const handleReturnHome = () => {
    resetCart();
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryCheckout = () => {
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-earth-900 dark:bg-earth-900 dark:text-cream-100 selection:bg-clay-200 dark:selection:bg-gold-500/25 select-none transition-colors duration-300">
      
      {/* ─── LOADER SCREEN ─── */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-cream-50 dark:bg-earth-900 transition-all">
          <div className="text-center space-y-4">
            <div className="ld-spinner mx-auto"></div>
            <h1 className="text-sm font-serif tracking-[0.2em] uppercase font-bold text-earth-800 dark:text-cream-200 animate-pulse">
              {t('loading')}
            </h1>
          </div>
        </div>
      )}

      {/* Header */}
      <Header onCartOpen={() => setCartOpen(true)} setView={setView} />

      {/* Pages Container */}
      <div className="flex-1 flex flex-col">
        {view === 'home' && (
          <Home
            onAddToCart={(p) => {
              addCart(p);
              showToast(t('addedBag'), 'success');
            }}
          />
        )}

        {view === 'checkout' && (
          <Checkout
            onSubmitCheckout={handleCheckoutSubmit}
            setView={setView}
          />
        )}

        {view === 'confirm' && (
          <Confirm
            ordNo={ordNo}
            expDate={expDate}
            chk={chk}
            onContinue={handleReturnHome}
          />
        )}

        {view === 'payment-status' && (
          <PaymentStatus
            ordNo={ordNo}
            expDate={expDate}
            chk={chk}
            onContinue={handleReturnHome}
            onRetryCheckout={handleRetryCheckout}
          />
        )}
      </div>

      {/* Footer */}
      <Footer onAdminTrigger={() => {}} />

      {/* Cart Drawer Panel */}
      <CartDrawer
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        setView={setView}
      />

      {/* Toast popup */}
      <Toast toast={toast} onClose={handleCloseToast} />
    </div>
  );
};

export default function App() {
  return (
    <DarkModeProvider>
      <I18nProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </I18nProvider>
    </DarkModeProvider>
  );
}
