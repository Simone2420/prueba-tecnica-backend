import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3001';

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import { authMiddleware } from './middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all requests
app.use(limiter);

// Protect the proxy routes with dual authentication
app.use('/api/v1/payments', authMiddleware, createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/payments': '', 
  },
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
