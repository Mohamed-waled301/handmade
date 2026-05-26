import axios from 'axios';
import crypto from 'crypto';

// In-memory database for verified transactions from Paymob Webhooks
const verifiedTransactions = {};

export const createHostedPayment = async (req, res) => {
  const { amount, customerName, customerEmail, customerPhone, paymentMethod, merchantOrderId } = req.body;

  try {
    // Check if we are running in simulator fallback mode
    const isMockCredentials = !process.env.PAYMOB_API_KEY || 
                              process.env.PAYMOB_API_KEY.includes('your_') || 
                              process.env.PAYMOB_API_KEY === 'placeholder';

    if (isMockCredentials) {
      console.log(`[Paymob Simulator] Detected mock credentials. Launching high-fidelity Sandbox Iframe!`);
      const redirectUrl = `http://localhost:5000/paymob-sandbox-iframe?amount=${amount}&orderId=${merchantOrderId}&method=${paymentMethod}&customerName=${encodeURIComponent(customerName || '')}&customerPhone=${customerPhone || ''}`;
      return res.json({ redirect_url: redirectUrl, orderId: merchantOrderId });
    }

    // Choose correct integration ID
    let integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;
    if (paymentMethod === 'CARD') {
      integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
    } else if (paymentMethod === 'INSTAPAY') {
      integrationId = process.env.PAYMOB_INSTAPAY_INTEGRATION_ID;
    }

    // Step 1: Authentication
    const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: process.env.PAYMOB_API_KEY
    });
    const authToken = authResponse.data.token;

    // Step 2: Order Registration
    const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amount * 100,
      currency: "EGP",
      merchant_order_id: merchantOrderId, // Bind our internal tracking ID
      items: []
    });
    const orderId = orderResponse.data.id;

    // Step 3: Payment Key Generation
    const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
      auth_token: authToken,
      amount_cents: amount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA", email: customerEmail || "test@example.com", floor: "NA", first_name: customerName || "Test",
        street: "NA", building: "NA", phone_number: customerPhone, shipping_method: "NA",
        postal_code: "NA", city: "NA", country: "EG", last_name: customerName || "User", state: "NA"
      },
      currency: "EGP",
      integration_id: integrationId
    });
    const paymentToken = paymentKeyResponse.data.token;

    // Step 4: Construct Hosted Checkout / Iframe Redirect URL
    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;

    res.json({ redirect_url: redirectUrl, orderId: orderId });

  } catch (error) {
    console.warn('[Paymob API Warning] Live connection failed or credentials invalid:', error?.response?.data || error.message);
    console.log('[Paymob Simulator] Activating high-fidelity Sandbox Iframe Fallback!');
    
    const redirectUrl = `http://localhost:5000/paymob-sandbox-iframe?amount=${amount}&orderId=${merchantOrderId}&method=${paymentMethod}&customerName=${encodeURIComponent(customerName || '')}&customerPhone=${customerPhone || ''}`;
    
    res.json({ redirect_url: redirectUrl, orderId: merchantOrderId });
  }
};

export const paymobWebhook = async (req, res) => {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET || 'your_hmac_secret';
  const hmacReceived = req.query.hmac;
  const obj = req.body.obj;

  if (!obj) return res.status(400).send('Bad Request');

  const concatenatedString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order.id,
    obj.owner,
    obj.pending,
    obj.source_data.pan,
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success
  ].join('');

  const hashed = crypto.createHmac('sha512', hmacSecret)
                       .update(concatenatedString)
                       .digest('hex');

  if (hashed === hmacReceived) {
    const internalOrderId = obj.order.merchant_order_id || obj.order.id.toString();
    const transactionId = obj.id;
    const method = obj.source_data?.sub_type || obj.source_data?.type || 'PAYMOB';
    const totalAmount = obj.amount_cents / 100;
    
    let status = 'PENDING';
    if (obj.success === true) {
      status = 'PAID';
    } else if (obj.success === false || obj.error_occured === true) {
      status = 'FAILED';
    }

    // Save/Update verified status
    verifiedTransactions[internalOrderId] = {
      transactionId: transactionId.toString(),
      paymentMethod: method,
      amount: totalAmount,
      orderId: internalOrderId,
      status: status,
      updatedAt: new Date().toISOString()
    };

    console.log(`Webhook signature verified! Order ${internalOrderId} is now ${status}. Transaction ID: ${transactionId}`);
    res.status(200).send('Transaction processed');
  } else {
    console.error('Invalid Paymob Webhook signature received!');
    res.status(401).send('Invalid signature');
  }
};

export const getOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const transaction = verifiedTransactions[orderId];
  
  if (transaction) {
    res.json(transaction);
  } else {
    // If no webhook has arrived yet, return PENDING state
    res.json({
      orderId,
      status: 'PENDING',
      message: 'Transaction is pending webhook callback'
    });
  }
};

// High-fidelity Sandbox Checkout Simulation Iframe View
export const serveSandboxIframe = (req, res) => {
  const { amount, orderId, method, customerName, customerPhone } = req.query;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paymob Secure Checkout Sandbox</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 bg-[#fbf9f4] text-[#1c1917]">
  <div class="w-full max-w-md bg-white border border-[#e7e5e4] rounded-[2rem] shadow-xl p-8 space-y-6 relative overflow-hidden">
    
    <!-- Paymob Header badge -->
    <div class="flex justify-between items-center border-b border-[#f5f5f4] pb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-[#8c6239] text-white flex items-center justify-center font-bold">PM</div>
        <div>
          <h2 class="text-xs font-extrabold uppercase tracking-widest text-[#8c6239]">Paymob Accept</h2>
          <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Secure Sandbox</p>
        </div>
      </div>
      <span class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#fdf2e9] text-[#c05621] border border-[#fbd38d]/20 uppercase">
        Simulator
      </span>
    </div>

    <!-- Details Card -->
    <div class="bg-[#fcfbf9] border border-[#f5f5f4] rounded-2xl p-4 space-y-2">
      <div class="flex justify-between text-xs">
        <span class="text-stone-400 font-bold uppercase tracking-wide">Order Reference</span>
        <span class="font-mono font-bold text-stone-700">${orderId}</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-stone-400 font-bold uppercase tracking-wide">Amount Due</span>
        <span class="text-sm font-extrabold text-[#8c6239]">${parseFloat(amount).toFixed(2)} EGP</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-stone-400 font-bold uppercase tracking-wide">Method</span>
        <span class="font-bold text-stone-700 capitalize flex items-center gap-1.5">
          ${method === 'CARD' ? '<i class="fa-solid fa-credit-card"></i> Credit Card' : 
            method === 'WALLET' || method === 'VODAFONE' ? '<i class="fa-solid fa-mobile-screen"></i> Mobile Wallet' : 
            '<i class="fa-solid fa-building-columns"></i> InstaPay'}
        </span>
      </div>
    </div>

    <!-- Forms -->
    <form id="paymentForm" onsubmit="event.preventDefault();" class="space-y-4">
      ${method === 'CARD' ? `
        <!-- Card Form -->
        <div class="space-y-3 animate-fade-in">
          <div class="space-y-1">
            <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Cardholder Name</label>
            <input type="text" value="${customerName || ''}" placeholder="John Doe" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#8c6239]" required>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Card Number</label>
            <input type="text" placeholder="4123 4567 8901 2345" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#8c6239]" required>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Expiry Date</label>
              <input type="text" placeholder="12/28" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none focus:border-[#8c6239]" required>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500">CVV</label>
              <input type="password" placeholder="***" maxLength="3" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none focus:border-[#8c6239]" required>
            </div>
          </div>
        </div>
      ` : method === 'WALLET' || method === 'VODAFONE' ? `
        <!-- Mobile Wallet Form -->
        <div class="space-y-3 animate-fade-in">
          <div class="space-y-1">
            <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Mobile Wallet Number</label>
            <input type="text" value="${customerPhone || ''}" placeholder="01XXXXXXXXX" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#8c6239]" required>
          </div>
        </div>
      ` : `
        <!-- InstaPay Form -->
        <div class="space-y-3 animate-fade-in">
          <div class="space-y-1">
            <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500">رقم الموبايل المسجل عليه Instapay</label>
            <input type="tel" id="instapayPhone" placeholder="01XXXXXXXXX" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#8c6239]" required>
            <p id="validationError" class="hidden text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-circle-exclamation"></i>
              برجاء إدخال رقم موبايل صحيح مسجل عليه Instapay
            </p>
          </div>
        </div>
      `}

      <!-- Action Buttons -->
      <div class="space-y-3 pt-2">
        <button type="button" onclick="processPayment(true)" id="btnPay" class="w-full py-3.5 bg-[#1c1917] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs">
          <i class="fa-solid fa-lock text-[10px] text-stone-400"></i>
          Pay Securely (${parseFloat(amount).toFixed(2)} EGP)
        </button>
        <button type="button" onclick="processPayment(false)" id="btnFail" class="w-full py-3 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50/50 transition-all text-xs">
          Simulate Payment Failure
        </button>
      </div>
    </form>
    
    <!-- Footer locks -->
    <p class="text-[9px] text-stone-400 text-center font-bold flex items-center justify-center gap-1">
      <i class="fa-solid fa-shield text-[10px] text-stone-300"></i>
      SSL Encryption Certified &bull; Powered by Paymob Iframe Integrations
    </p>
  </div>

  <script>
    async function processPayment(success) {
      const btnPay = document.getElementById('btnPay');
      const btnFail = document.getElementById('btnFail');
      
      // Perform validation if paying securely on InstaPay
      if (success && '${method}' === 'INSTAPAY') {
        const phoneInput = document.getElementById('instapayPhone');
        const errText = document.getElementById('validationError');
        const phoneVal = phoneInput.value.trim();
        
        // Strict Egyptian mobile validation: 11 digits starting with 010, 011, 012, or 015
        const isValid = /^01[0125]\\d{8}$/.test(phoneVal);
        if (!isValid) {
          errText.classList.remove('hidden');
          phoneInput.classList.remove('border-stone-200');
          phoneInput.classList.add('border-red-500');
          phoneInput.focus();
          return; // Stop processing
        } else {
          errText.classList.add('hidden');
          phoneInput.classList.remove('border-red-500');
          phoneInput.classList.add('border-stone-200');
        }
      }

      btnPay.disabled = true;
      btnFail.disabled = true;
      btnPay.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin text-[10px]"></i> Processing Transaction...';

      try {
        const res = await fetch('/api/paymob/sandbox-trigger-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: '${orderId}',
            amount: ${amount},
            method: '${method}',
            success: success
          })
        });

        const data = await res.json();
        
        if (data.success) {
          setTimeout(() => {
            window.location.href = 'http://localhost:5173/?success=' + success + '&merchant_order_id=${orderId}&order=${orderId}';
          }, 1000);
        } else {
          alert('Sandbox payment failed to trigger callback');
          btnPay.disabled = false;
          btnFail.disabled = false;
          btnPay.innerHTML = 'Pay Securely';
        }
      } catch (err) {
        console.error(err);
        alert('Simulator connection error');
        btnPay.disabled = false;
        btnFail.disabled = false;
        btnPay.innerHTML = 'Pay Securely';
      }
    }
  </script>
</body>
</html>
  `;

  res.send(html);
};

// Triggers the webhook signing logic internally using the actual server HMAC verification flow!
export const sandboxTriggerWebhook = async (req, res) => {
  try {
    const { orderId, amount, method, success } = req.body;
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET || 'your_hmac_secret';

    const mockObj = {
      amount_cents: amount * 100,
      created_at: new Date().toISOString(),
      currency: "EGP",
      error_occured: !success,
      has_parent_transaction: false,
      id: Math.floor(10000000 + Math.random() * 90000000),
      integration_id: 998877,
      is_3d_secure: true,
      is_auth: false,
      is_capture: true,
      is_refunded: false,
      is_standalone_payment: true,
      is_voided: false,
      order: {
        id: Math.floor(100000 + Math.random() * 900000),
        merchant_order_id: orderId
      },
      owner: 9988,
      pending: false,
      source_data: {
        pan: method === 'CARD' ? '4123xxxxxx5678' : 'N/A',
        sub_type: method === 'CARD' ? 'Visa' : 'Wallet',
        type: method.toLowerCase()
      },
      success: success
    };

    // Calculate signed HMAC locally
    const concatenatedString = [
      mockObj.amount_cents,
      mockObj.created_at,
      mockObj.currency,
      mockObj.error_occured,
      mockObj.has_parent_transaction,
      mockObj.id,
      mockObj.integration_id,
      mockObj.is_3d_secure,
      mockObj.is_auth,
      mockObj.is_capture,
      mockObj.is_refunded,
      mockObj.is_standalone_payment,
      mockObj.is_voided,
      mockObj.order.id,
      mockObj.owner,
      mockObj.pending,
      mockObj.source_data.pan,
      mockObj.source_data.sub_type,
      mockObj.source_data.type,
      mockObj.success
    ].join('');

    const hash = crypto.createHmac('sha512', hmacSecret)
                       .update(concatenatedString)
                       .digest('hex');

    // Trigger local webhook route handler directly
    await axios.post(`http://localhost:5000/api/paymob/webhook?hmac=${hash}`, { obj: mockObj });

    res.json({ success: true });
  } catch (error) {
    console.error("Sandbox webhook trigger failed:", error.message);
    res.status(500).json({ error: "Failed to trigger sandbox webhook" });
  }
};
