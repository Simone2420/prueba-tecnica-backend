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
import CircuitBreaker from 'opossum';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);

// Circuit Breaker setup
const breaker = new CircuitBreaker(async () => true, {
  timeout: 3000, // If our dummy function takes longer than 3s, trigger a failure (won't happen here)
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 10000 // After 10 seconds, try again
});

const proxy = createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/payments': '', 
  },
  on: {
    error: (err, req, res) => {
      breaker.fire().catch(() => {}); // Manually register a failure
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payment Service is down or unreachable' }));
    }
  }
});

// Protect the proxy routes with dual authentication and circuit breaker
app.use('/api/v1/payments', authMiddleware, (req, res, next) => {
  if (breaker.opened) {
    return res.status(503).json({ error: 'Service Unavailable (Circuit Open)' });
  }
  proxy(req, res, next);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
