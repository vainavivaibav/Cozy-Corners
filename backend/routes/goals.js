const router = require('express').Router();
const db = require('../db');

// GET /api/goals?user_id=X
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const [rows] = await db.execute('SELECT * FROM goal WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/goals
router.post('/', async (req, res) => {
    try {
        console.log('[GOALS POST] req.body:', JSON.stringify(req.body));
        const { user_id, title, target_hours, deadline } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'user_id and title required' });
        const [result] = await db.execute(
            'INSERT INTO goal (user_id, title, target_hours, deadline) VALUES (?, ?, ?, ?)',
            [user_id, title, target_hours || 0, deadline || null]
        );
        res.status(201).json({ goal_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/goals/:id
router.put('/:id', async (req, res) => {
    try {
        const { title, target_hours, deadline, status } = req.body;
        await db.execute(
            'UPDATE goal SET title=COALESCE(?,title), target_hours=COALESCE(?,target_hours), deadline=COALESCE(?,deadline), status=COALESCE(?,status) WHERE goal_id=?',
            [
                title !== undefined ? title : null, 
                target_hours !== undefined ? target_hours : null, 
                deadline !== undefined ? deadline : null, 
                status !== undefined ? status : null, 
                req.params.id
            ]
        );
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM goal WHERE goal_id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
