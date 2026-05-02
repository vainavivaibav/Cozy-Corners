const router = require('express').Router();
const db = require('../db');

// GET /api/pomodoro?user_id=X
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const [rows] = await db.execute('SELECT * FROM pomodoro_session WHERE user_id = ? ORDER BY start_time DESC LIMIT 50', [user_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/pomodoro (start session)
router.post('/', async (req, res) => {
    try {
        console.log('[POMODORO POST] req.body:', JSON.stringify(req.body));
        const { user_id, task_id, session_type } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const [result] = await db.execute(
            'INSERT INTO pomodoro_session (user_id, task_id, start_time, session_type) VALUES (?, ?, NOW(), ?)',
            [user_id, task_id || null, session_type || 'work']
        );
        res.status(201).json({ session_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/pomodoro/:id (complete/cancel session)
router.put('/:id', async (req, res) => {
    try {
        console.log('[POMODORO PUT] id:', req.params.id, 'body:', JSON.stringify(req.body));
        const { status, duration } = req.body;
        await db.execute(
            'UPDATE pomodoro_session SET end_time=NOW(), duration=?, status=? WHERE session_id=?',
            [duration || 0, status || 'completed', req.params.id]
        );
        // Update session_analytics
        const [sess] = await db.execute('SELECT user_id, session_type, duration FROM pomodoro_session WHERE session_id=?', [req.params.id]);
        if (sess.length > 0) {
            const s = sess[0];
            const today = new Date().toISOString().split('T')[0];
            const col = s.session_type === 'work' ? 'total_focus_time' : 'total_break_time';
            await db.execute(
                `INSERT INTO session_analytics (user_id, ${col}, date) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE ${col} = ${col} + ?`,
                [s.user_id, s.duration, today, s.duration]
            );
        }
        res.json({ message: 'Session updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
