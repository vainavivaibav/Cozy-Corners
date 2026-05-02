const router = require('express').Router();
const db = require('../db');

// GET /api/mode/:user_id
router.get('/:user_id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM mode WHERE user_id = ?', [req.params.user_id]);
        if (rows.length === 0) return res.json({ theme: 'night', day_count: 0, night_count: 0 });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/mode/:user_id — toggle theme and track counts
router.put('/:user_id', async (req, res) => {
    try {
        const { theme } = req.body;
        if (!theme) return res.status(400).json({ error: 'theme required (day or night)' });
        const incCol = theme === 'day' ? 'day_count' : 'night_count';
        await db.execute(
            `INSERT INTO mode (user_id, theme, ${incCol}) VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE theme = ?, ${incCol} = ${incCol} + 1`,
            [req.params.user_id, theme, theme]
        );
        res.json({ message: 'Mode updated', theme });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
