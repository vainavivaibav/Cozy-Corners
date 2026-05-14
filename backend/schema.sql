-- Cozy Corner Database Schema (3NF)
CREATE DATABASE IF NOT EXISTS cozy_corner;
USE cozy_corner;

-- USER
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dob DATE,
    phone VARCHAR(20)
);

-- TAG
CREATE TABLE IF NOT EXISTS tag (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- TASK
CREATE TABLE IF NOT EXISTS task (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- TASK_TAG (junction)
CREATE TABLE IF NOT EXISTS task_tag (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE
);

-- GOAL
CREATE TABLE IF NOT EXISTS goal (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_hours DECIMAL(6,2) DEFAULT 0,
    deadline DATE,
    status ENUM('active','completed','abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- POMODORO_SESSION
CREATE TABLE IF NOT EXISTS pomodoro_session (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INT DEFAULT 0 COMMENT 'duration in seconds',
    session_type ENUM('work','break') DEFAULT 'work',
    status ENUM('running','completed','cancelled') DEFAULT 'running',
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE SET NULL
);

-- MUSIC_HISTORY
CREATE TABLE IF NOT EXISTS music_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    track_name VARCHAR(255),
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- ACHIEVEMENT
CREATE TABLE IF NOT EXISTS achievement (
    ac_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    condition_type VARCHAR(50) NOT NULL,
    condition_value INT NOT NULL
);

-- USER_ACHIEVEMENT
CREATE TABLE IF NOT EXISTS user_achievement (
    user_id INT NOT NULL,
    ac_id INT NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ac_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (ac_id) REFERENCES achievement(ac_id) ON DELETE CASCADE
);

-- SESSION_ANALYTICS
CREATE TABLE IF NOT EXISTS session_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_focus_time INT DEFAULT 0 COMMENT 'in seconds',
    total_break_time INT DEFAULT 0 COMMENT 'in seconds',
    date DATE NOT NULL,
    UNIQUE KEY unique_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    type ENUM('info','success','warning','reminder') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- MODE (user theme/preference tracking)
CREATE TABLE IF NOT EXISTS mode (
    mode_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(10) DEFAULT 'night',
    day_count INT DEFAULT 0,
    night_count INT DEFAULT 0,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- =============================================
-- VIEWS
-- =============================================

-- VIEW 1: User Task Summary (tasks with their tags in one view)
CREATE OR REPLACE VIEW user_task_summary AS
SELECT t.task_id, t.user_id, u.username, t.title, t.description,
       t.due_date, t.status, t.created_at,
       GROUP_CONCAT(tg.name ORDER BY tg.name) AS tags
FROM task t
JOIN user u ON t.user_id = u.user_id
LEFT JOIN task_tag tt ON t.task_id = tt.task_id
LEFT JOIN tag tg ON tt.tag_id = tg.tag_id
GROUP BY t.task_id;

-- VIEW 2: User Productivity Dashboard (aggregated stats per user)
CREATE OR REPLACE VIEW user_productivity AS
SELECT u.user_id, u.username,
       (SELECT COUNT(*) FROM task WHERE user_id = u.user_id) AS total_tasks,
       (SELECT COUNT(*) FROM task WHERE user_id = u.user_id AND status = 'completed') AS completed_tasks,
       (SELECT COUNT(*) FROM pomodoro_session WHERE user_id = u.user_id AND status = 'completed') AS total_sessions,
       (SELECT COALESCE(SUM(total_focus_time), 0) FROM session_analytics WHERE user_id = u.user_id) AS total_focus_seconds,
       (SELECT COUNT(*) FROM goal WHERE user_id = u.user_id) AS total_goals,
       (SELECT COUNT(*) FROM goal WHERE user_id = u.user_id AND status = 'completed') AS completed_goals
FROM user u;

-- VIEW 3: User Achievements with details
CREATE OR REPLACE VIEW user_achievement_view AS
SELECT u.username, a.title AS achievement_title, a.description,
       a.condition_type, a.condition_value, ua.earned_date
FROM user_achievement ua
JOIN user u ON ua.user_id = u.user_id
JOIN achievement a ON ua.ac_id = a.ac_id;

-- =============================================
-- TRANSACTION EXAMPLE (for reference / demo)
-- =============================================
-- Transactions ensure atomicity: either ALL operations succeed, or NONE do.
-- Used when creating a task with tags (if tag insert fails, task insert is rolled back).
--
-- Example:
-- START TRANSACTION;
--   INSERT INTO task (user_id, title) VALUES (3, 'Study DBMS');
--   SET @new_task_id = LAST_INSERT_ID();
--   INSERT INTO task_tag (task_id, tag_id) VALUES (@new_task_id, 1);
--   INSERT INTO task_tag (task_id, tag_id) VALUES (@new_task_id, 5);
-- COMMIT;
-- On error: ROLLBACK;

-- =============================================
-- GRANT / REVOKE (Access Control)
-- =============================================
-- Create a restricted application user (instead of using root)
-- CREATE USER IF NOT EXISTS 'cozy_app'@'localhost' IDENTIFIED BY 'cozy_secure_2026';

-- GRANT only the permissions the app needs (principle of least privilege)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cozy_corner.* TO 'cozy_app'@'localhost';

-- REVOKE dangerous permissions the app should NEVER have
-- REVOKE DROP, ALTER, CREATE, INDEX, GRANT OPTION ON cozy_corner.* FROM 'cozy_app'@'localhost';

-- FLUSH PRIVILEGES;

-- To verify permissions:
-- SHOW GRANTS FOR 'cozy_app'@'localhost';
