const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/items
router.get('/items', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status
      ? 'SELECT * FROM items WHERE status = $1 ORDER BY id DESC'
      : 'SELECT * FROM items ORDER BY id DESC';
    const values = status ? [status] : [];
    const result = await pool.query(query, values);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/items/:id
router.get('/items/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items
router.post('/items', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
    const result = await pool.query(
      'INSERT INTO items (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || '']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/items/:id
router.put('/items/:id', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const result = await pool.query(
      `UPDATE items SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status)
       WHERE id = $4 RETURNING *`,
      [title, description, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/items/:id
router.delete('/items/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stats
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM items
    `);
    const s = result.rows[0];
    res.json({
      success: true,
      data: {
        total: parseInt(s.total),
        active: parseInt(s.active),
        completed: parseInt(s.completed),
        nodeVersion: process.version
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
