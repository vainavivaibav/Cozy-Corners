const router = require('express').Router();
const db = require('../db');

// GET /api/tags
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM tag ORDER BY name');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tags
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });
        const [result] = await db.execute('INSERT IGNORE INTO tag (name) VALUES (?)', [name.toLowerCase()]);
        res.status(201).json({ tag_id: result.insertId, name });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
