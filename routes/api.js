const express = require('express');
const router = express.Router();

let items = [
  { id: 1, title: 'Task e parë', description: 'Shembull detyre', status: 'active', createdAt: new Date().toISOString() },
  { id: 2, title: 'Task e dytë', description: 'Detyrë tjetër shembull', status: 'completed', createdAt: new Date().toISOString() }
];
let nextId = 3;


router.get('/items', (req, res) => {
  const { status } = req.query;
  const result = status ? items.filter(i => i.status === status) : items;
  res.json({ success: true, count: result.length, data: result });
});

router.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  res.json({ success: true, data: item });
});