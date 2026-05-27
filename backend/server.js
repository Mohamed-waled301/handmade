import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createOrder,
  createHostedPayment,
  paymobWebhook,
  getOrderStatus,
  cancelOrder,
  serveSandboxIframe,
  sandboxTriggerWebhook,
  uploadInstaPayReceipt
} from './controllers/paymob.js';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — restrict to known origins
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-app-client'],
  credentials: true
}));
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Security Middlewares ───
// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// CSRF Protection (Header check for non-webhook state-changing requests)
const csrfProtection = (req, res, next) => {
  // Webhooks from Paymob don't have our custom header, skip them
  const path = req.path;
  const originalUrl = req.originalUrl;
  if (
    path === '/paymob/webhook' || 
    path === '/paymob/sandbox-trigger-webhook' ||
    originalUrl === '/api/paymob/webhook' || 
    originalUrl === '/api/paymob/sandbox-trigger-webhook'
  ) {
    return next();
  }
  // Only apply to POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const appClientHeader = req.headers['x-app-client'];
    if (appClientHeader !== 'HandmadeFrontend') {
      return res.status(403).json({ error: 'CSRF token missing or invalid.' });
    }
  }
  next();
};

app.use('/api/', apiLimiter);
app.use('/api/', csrfProtection);

// ─── Order Routes ───
app.post('/api/orders/create', createOrder);
app.get('/api/orders/:orderId/status', getOrderStatus);
app.post('/api/orders/:orderId/cancel', cancelOrder);
app.post('/api/orders/:orderId/upload-receipt', uploadInstaPayReceipt);

// ─── Payment Routes ───
app.post('/api/paymob/create-hosted-payment', createHostedPayment);
app.post('/api/paymob/webhook', paymobWebhook);

// ─── Sandbox Routes (Development Only) ───
if (process.env.NODE_ENV !== 'production') {
  app.get('/paymob-sandbox-iframe', serveSandboxIframe);
  app.post('/api/paymob/sandbox-trigger-webhook', sandboxTriggerWebhook);
  console.log('[Sandbox] Development sandbox routes enabled.');
}

// Startup warnings
const apiKey = process.env.PAYMOB_API_KEY;
if (!apiKey || apiKey.includes('your_') || apiKey === 'placeholder') {
  console.warn('⚠️  WARNING: Running with mock Paymob credentials. Sandbox mode active.');
  console.warn('⚠️  Set real PAYMOB_API_KEY in .env for production use.');
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
