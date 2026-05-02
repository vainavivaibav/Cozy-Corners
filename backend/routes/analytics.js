const router = require('express').Router();
const db = require('../db');

// GET /api/analytics?user_id=X&days=7
router.get('/', async (req, res) => {
    try {
        const { user_id, days } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        const d = parseInt(days) || 7;
        const [rows] = await db.execute(
            'SELECT * FROM session_analytics WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY date DESC',
            [user_id, d]
        );
        // Summary
        const [summary] = await db.execute(
            `SELECT COUNT(*) as total_sessions,
             COALESCE(SUM(total_focus_time),0) as total_focus,
             COALESCE(SUM(total_break_time),0) as total_break
             FROM session_analytics WHERE user_id = ?`,
            [user_id]
        );
        const [taskStats] = await db.execute(
            `SELECT COUNT(*) as total, SUM(status='completed') as completed, SUM(due_date < CURDATE() AND status != 'completed') as overdue FROM task WHERE user_id = ?`,
            [user_id]
        );
        const [goalStats] = await db.execute(
            `SELECT COUNT(*) as total, SUM(status='completed') as completed FROM goal WHERE user_id = ?`,
            [user_id]
        );
        res.json({
            daily: rows,
            summary: summary[0],
            tasks: taskStats[0],
            goals: goalStats[0]
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
