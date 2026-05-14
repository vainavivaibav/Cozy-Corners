const router = require('express').Router();
const db = require('../db');

// GET /api/tasks?user_id=X&status=Y
router.get('/', async (req, res) => {
    try {
        const { user_id, status } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        let sql = `SELECT t.*, GROUP_CONCAT(tg.name) as tags FROM task t
            LEFT JOIN task_tag tt ON t.task_id = tt.task_id
            LEFT JOIN tag tg ON tt.tag_id = tg.tag_id
            WHERE t.user_id = ?`;
        const params = [user_id];
        if (status) { sql += ' AND t.status = ?'; params.push(status); }
        sql += ' GROUP BY t.task_id ORDER BY t.created_at DESC';
        const [rows] = await db.execute(sql, params);
        rows.forEach(r => { r.tags = r.tags ? r.tags.split(',') : []; });
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tasks (uses TRANSACTION for atomicity)
router.post('/', async (req, res) => {
    const conn = await db.getConnection(); // get a dedicated connection for transaction
    try {
        console.log('[TASKS POST] req.body:', JSON.stringify(req.body));
        const { user_id, title, description, due_date, tags } = req.body;
        if (!user_id || !title) { conn.release(); return res.status(400).json({ error: 'user_id and title required' }); }

        await conn.beginTransaction(); // START TRANSACTION

        const [result] = await conn.execute(
            'INSERT INTO task (user_id, title, description, due_date) VALUES (?, ?, ?, ?)',
            [user_id, title, description || null, due_date || null]
        );
        const taskId = result.insertId;

        // Attach tags (within same transaction)
        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                const [tagRows] = await conn.execute('SELECT tag_id FROM tag WHERE name = ?', [tagName]);
                if (tagRows.length > 0) {
                    await conn.execute('INSERT IGNORE INTO task_tag (task_id, tag_id) VALUES (?, ?)', [taskId, tagRows[0].tag_id]);
                }
            }
        }

        await conn.commit(); // COMMIT — all succeeded
        conn.release();
        res.status(201).json({ task_id: taskId });
    } catch (err) {
        await conn.rollback(); // ROLLBACK — undo everything on error
        conn.release();
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    try {
        console.log('[TASKS PUT] id:', req.params.id, 'body:', JSON.stringify(req.body));
        const { title, description, due_date, status } = req.body;
        await db.execute(
            'UPDATE task SET title=COALESCE(?,title), description=COALESCE(?,description), due_date=COALESCE(?,due_date), status=COALESCE(?,status) WHERE task_id=?',
            [
                title !== undefined ? title : null, 
                description !== undefined ? description : null, 
                due_date !== undefined ? due_date : null, 
                status !== undefined ? status : null, 
                req.params.id
            ]
        );
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM task WHERE task_id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
