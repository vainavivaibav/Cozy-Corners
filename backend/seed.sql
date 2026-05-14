USE cozy_corner;

-- Default tags
INSERT IGNORE INTO tag (name) VALUES
('study'), ('work'), ('personal'), ('health'), ('urgent'), ('other');

-- Default achievements
INSERT IGNORE INTO achievement (title, description, condition_type, condition_value) VALUES
('First Task', 'Complete your first task', 'tasks_completed', 1),
('Task Master', 'Complete 10 tasks', 'tasks_completed', 10),
('Centurion', 'Complete 100 tasks', 'tasks_completed', 100),
('Focus Starter', 'Complete your first Pomodoro session', 'pomodoro_completed', 1),
('Deep Focus', 'Complete 10 Pomodoro sessions', 'pomodoro_completed', 10),
('Marathon', 'Accumulate 10 hours of focus time', 'focus_hours', 10),
('Goal Setter', 'Set your first goal', 'goals_set', 1),
('Goal Crusher', 'Complete 5 goals', 'goals_completed', 5),
('Streak 3', 'Use the app 3 days in a row', 'streak_days', 3),
('Streak 7', 'Use the app 7 days in a row', 'streak_days', 7);
SELECT * FROM user;

SELECT * FROM task;
select * from music_history;
select * from achievement;
select * from goal;
select * from mode;
select * from notification;
select * from playlist;
select * from pomodoro_session;
select * from session_analytics;
select * from tag;
select * from task;
select * from task_tag;
select * from user_achievement;

show tables;
show databases;