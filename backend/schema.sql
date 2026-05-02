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
