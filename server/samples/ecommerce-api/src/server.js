import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { productRouter } from './routes/products.js';
import { orderRouter } from './routes/orders.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// Primary API Endpoints
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Nexus E-Commerce Gateway listening on port ${PORT}`);
});

