const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// POST /api/users/signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, dob, phone } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Username, email and password required' });
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO user (username, email, password, dob, phone) VALUES (?, ?, ?, ?, ?)',
            [username, email, hash, dob || null, phone || null]
        );
        // Create default mode entry
        await db.execute('INSERT INTO mode (user_id) VALUES (?)', [result.insertId]);
        res.status(201).json({ user_id: result.insertId, username, email });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email already exists' });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Incorrect password' });
        res.json({ user_id: user.user_id, username: user.username, email: user.email });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, username, email, created_at, dob, phone FROM user WHERE user_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const { email, dob, phone } = req.body;
        await db.execute('UPDATE user SET email=COALESCE(?,email), dob=COALESCE(?,dob), phone=COALESCE(?,phone) WHERE user_id=?',
            [
                email !== undefined ? email : null,
                dob !== undefined ? dob : null,
                phone !== undefined ? phone : null,
                req.params.id
            ]
        );
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
