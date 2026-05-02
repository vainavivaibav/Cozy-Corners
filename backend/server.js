require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/pomodoro', require('./routes/pomodoro'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/mode', require('./routes/mode'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Fallback: serve index.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

app.listen(PORT, () => {
    console.log(`Cozy Corner server running at http://localhost:${PORT}`);
});
