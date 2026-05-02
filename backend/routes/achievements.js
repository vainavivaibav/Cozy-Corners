const router = require('express').Router();
const db = require('../db');

// GET /api/achievements (all achievements)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM achievement ORDER BY condition_value');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/achievements/user/:user_id (user's earned achievements)
router.get('/user/:user_id', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT a.*, ua.earned_date FROM achievement a
             INNER JOIN user_achievement ua ON a.ac_id = ua.ac_id
             WHERE ua.user_id = ? ORDER BY ua.earned_date DESC`,
            [req.params.user_id]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/achievements/check — check and award achievements
router.post('/check', async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });

        const [achievements] = await db.execute('SELECT * FROM achievement');
        const [earned] = await db.execute('SELECT ac_id FROM user_achievement WHERE user_id = ?', [user_id]);
        const earnedIds = earned.map(e => e.ac_id);
        const newlyEarned = [];

        for (const a of achievements) {
            if (earnedIds.includes(a.ac_id)) continue;
            let count = 0;
            if (a.condition_type === 'tasks_completed') {
                const [r] = await db.execute("SELECT COUNT(*) as c FROM task WHERE user_id=? AND status='completed'", [user_id]);
                count = r[0].c;
            } else if (a.condition_type === 'pomodoro_completed') {
                const [r] = await db.execute("SELECT COUNT(*) as c FROM pomodoro_session WHERE user_id=? AND status='completed' AND session_type='work'", [user_id]);
                count = r[0].c;
            } else if (a.condition_type === 'goals_set') {
                const [r] = await db.execute('SELECT COUNT(*) as c FROM goal WHERE user_id=?', [user_id]);
                count = r[0].c;
            } else if (a.condition_type === 'goals_completed') {
                const [r] = await db.execute("SELECT COUNT(*) as c FROM goal WHERE user_id=? AND status='completed'", [user_id]);
                count = r[0].c;
            } else if (a.condition_type === 'focus_hours') {
                const [r] = await db.execute('SELECT COALESCE(SUM(total_focus_time),0) as s FROM session_analytics WHERE user_id=?', [user_id]);
                count = Math.floor(r[0].s / 3600);
            }
            if (count >= a.condition_value) {
                await db.execute('INSERT IGNORE INTO user_achievement (user_id, ac_id) VALUES (?, ?)', [user_id, a.ac_id]);
                newlyEarned.push(a);
            }
        }
        res.json({ newly_earned: newlyEarned });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
