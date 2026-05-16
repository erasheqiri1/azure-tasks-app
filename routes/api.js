const express = require('express');
const router = express.Router();

let items = [
  { id: 1, title: 'Task e parë', description: 'Shembull detyre', status: 'active', createdAt: new Date().toISOString() },
  { id: 2, title: 'Task e dytë', description: 'Detyrë tjetër shembull', status: 'completed', createdAt: new Date().toISOString() }
];
let nextId = 3;

// GET /api/items
router.get('/items', (req, res) => {
  const { status } = req.query;
  const result = status ? items.filter(i => i.status === status) : items;
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/items/:id
router.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  res.json({ success: true, data: item });
});

// POST /api/items
router.post('/items', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

  const item = {
    id: nextId++,
    title,
    description: description || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  items.push(item);
  res.status(201).json({ success: true, data: item });
});

// PUT /api/items/:id
router.put('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Item not found' });

  const { title, description, status } = req.body;
  items[index] = { ...items[index], title: title || items[index].title, description: description ?? items[index].description, status: status || items[index].status };
  res.json({ success: true, data: items[index] });
});

// DELETE /api/items/:id
router.delete('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Item not found' });

  items.splice(index, 1);
  res.json({ success: true, message: 'Item deleted successfully' });
});

// GET /api/stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: items.length,
      active: items.filter(i => i.status === 'active').length,
      completed: items.filter(i => i.status === 'completed').length,
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      uptime: (() => { const s = Math.floor(process.uptime()); const m = Math.floor(s/60); return m > 0 ? `${m}m ${s%60}s` : `${s}s`; })()
    }
  });
});

module.exports = router;