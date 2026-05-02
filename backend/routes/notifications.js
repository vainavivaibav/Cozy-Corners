const router = require('express').Router();
const db = require('../db');

// GET /api/notifications?user_id=X
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const [rows] = await db.execute('SELECT * FROM notification WHERE user_id = ? ORDER BY created_at DESC LIMIT 30', [user_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications
router.post('/', async (req, res) => {
    try {
        const { user_id, message, type } = req.body;
        if (!user_id || !message) return res.status(400).json({ error: 'user_id and message required' });
        const [result] = await db.execute(
            'INSERT INTO notification (user_id, message, type) VALUES (?, ?, ?)',
            [user_id, message, type || 'info']
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
    try {
        await db.execute('UPDATE notification SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/read-all?user_id=X
router.put('/read-all', async (req, res) => {
    try {
        const { user_id } = req.query;
        await db.execute('UPDATE notification SET is_read = TRUE WHERE user_id = ?', [user_id]);
        res.json({ message: 'All marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
