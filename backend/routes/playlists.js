const router = require('express').Router();
const db = require('../db');

// POST /api/playlists/history — log music play
router.post('/history', async (req, res) => {
    try {
        console.log('[MUSIC_HISTORY POST] req.body:', JSON.stringify(req.body));
        const { user_id, track_name } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const [result] = await db.execute(
            'INSERT INTO music_history (user_id, track_name) VALUES (?, ?)',
            [user_id, track_name || null]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/playlists/history?user_id=X
router.get('/history', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const [rows] = await db.execute('SELECT * FROM music_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 50', [user_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
