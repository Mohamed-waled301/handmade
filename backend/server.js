import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  createHostedPayment, 
  paymobWebhook, 
  getOrderStatus, 
  serveSandboxIframe, 
  sandboxTriggerWebhook 
} from './controllers/paymob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/paymob/create-hosted-payment', createHostedPayment);
app.get('/api/paymob/order-status/:orderId', getOrderStatus);
app.post('/api/paymob/webhook', paymobWebhook);

// High-Fidelity Sandbox Simulator Routes
app.get('/paymob-sandbox-iframe', serveSandboxIframe);
app.post('/api/paymob/sandbox-trigger-webhook', sandboxTriggerWebhook);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
