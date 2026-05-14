# 🌙 Cozy Corner

A full-stack productivity web app designed to help you focus, track tasks, and stay motivated — with a cozy aesthetic.

🔗 **Live Demo:** [cozy-corners-production.up.railway.app](https://cozy-corners-production.up.railway.app)

---

## ✨ Features

- **User Authentication** — Register and log in with secure password storage
- **Task Manager** — Create, update, and track tasks with statuses (pending, in progress, completed) and custom tags
- **Goal Tracker** — Set goals with target hours and deadlines
- **Pomodoro Timer** — Focus sessions with work/break tracking linked to your tasks
- **Spotify Integration** — Listen to music while you work, with play history saved
- **Analytics Dashboard** — View your daily focus time and break time stats
- **Achievements System** — Earn achievements based on your productivity milestones
- **Notifications** — In-app notifications for reminders and updates
- **Theme Mode** — Switch between day and night themes, with usage tracking

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Hosting | Railway |

---

## 🗄 Database Design

Designed in **3NF (Third Normal Form)** with 12 tables:

- `user` — stores user accounts
- `task` + `tag` + `task_tag` — tasks with many-to-many tag relationships
- `goal` — user goals with deadlines
- `pomodoro_session` — focus/break session records linked to tasks
- `music_history` — track listening history
- `achievement` + `user_achievement` — gamified productivity achievements
- `session_analytics` — daily aggregated focus/break time per user
- `notification` — in-app notification system
- `mode` — theme preference tracking (day/night usage counts)

---

## 🚀 Running Locally

### Prerequisites
- Node.js
- MySQL

### Setup

```bash
# Clone the repo
git clone https://github.com/vainavivaibav/Cozy-Corners.git
cd Cozy-Corners/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Run the schema and seed
mysql -u root -p < schema.sql
mysql -u root -p cozy_corner < seed.sql

# Start the server
node server.js
```

Then open `http://localhost:3000` in your browser.

### Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cozy_corner
DB_PORT=3306
```

---

## 📁 Project Structure

```
Cozy-Corners/
├── backend/
│   ├── routes/          # API route handlers
│   ├── db.js            # MySQL connection pool
│   ├── server.js        # Express server
│   ├── schema.sql       # Database schema
│   ├── seed.sql         # Sample data
│   ├── index.html       # Landing page
│   ├── front.html       # Dashboard
│   ├── todo.html        # Task manager
│   ├── pomodoro.html    # Pomodoro timer
│   ├── spotify.html     # Music player
│   ├── games.html       # Games page
│   └── styles.css       # Global styles
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login |
| GET | `/api/tasks?user_id=` | Get user tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/goals?user_id=` | Get user goals |
| POST | `/api/pomodoro/start` | Start a pomodoro session |
| GET | `/api/analytics?user_id=` | Get focus analytics |
| GET | `/api/achievements?user_id=` | Get user achievements |

---

## 🎓 About

Built as a **DBMS (Database Management Systems) course project** to demonstrate real-world application of relational database design, normalization, and full-stack web development.
