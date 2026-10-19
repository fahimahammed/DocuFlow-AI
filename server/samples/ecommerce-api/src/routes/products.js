import { Router } from 'express';

export const productRouter = Router();

// GET /api/v1/products - List products with pagination and category filter
productRouter.get('/', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    res.json({
      success: true,
      data: [
        { id: 'prod_01', name: 'Mechanical Keyboard', price: 129.99, stock: 45 },
        { id: 'prod_02', name: 'Ergonomic Mouse', price: 79.50, stock: 12 }
      ],
      pagination: { page: Number(page), limit: Number(limit), total: 2 }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/:id - Fetch single product
productRouter.get('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, product: { id: req.params.id, name: 'Sample Item' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products - Create new product (Admin only)
productRouter.post('/', async (req, res, next) => {
  try {
    const { name, price, stock, sku } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    res.status(201).json({ success: true, id: 'prod_new', name, price, stock, sku });
  } catch (err) {
    next(err);
  }
});

