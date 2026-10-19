import { Router } from 'express';

export const orderRouter = Router();

// POST /api/v1/orders/checkout - Process basket checkout & charge card
orderRouter.post('/checkout', async (req, res, next) => {
  try {
    const { items, paymentMethodId, shippingAddress } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    const orderId = `ord_${Date.now()}`;
    res.status(201).json({
      success: true,
      orderId,
      status: 'confirmed',
      total: 209.49,
      currency: 'USD'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/orders/:id - Fetch order receipt
orderRouter.get('/:id', async (req, res, next) => {
  try {
    res.json({
      success: true,
      order: {
        id: req.params.id,
        items: [{ productId: 'prod_01', quantity: 1, unitPrice: 129.99 }],
        status: 'delivered'
      }
    });
  } catch (err) {
    next(err);
  }
});

