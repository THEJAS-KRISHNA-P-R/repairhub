INSERT INTO users (username, email, password)
VALUES
  ('testuser', 'test@example.com', '$2a$10$XURPShlN1qhi.f6u7eB.RO2b0pI.9YQ2ABnX2weaJ6e1TJ1o2.7iG'),
  ('john_doe', 'john@example.com', '$2a$10$XURPShlN1qhi.f6u7eB.RO2b0pI.9YQ2ABnX2weaJ6e1TJ1o2.7iG')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO badges (name, description, variant) VALUES
  ('First Repair', 'Created your first repair log', 'DEFAULT'),
  ('Contributor', 'Posted 5 repair logs', 'SECONDARY'),
  ('Helpful', 'Made 10 comments', 'OUTLINE'),
  ('Community Star', 'Posts received 50+ views/upvotes', 'DEFAULT'),
  ('Expert Fixer', 'Completed 20 successful repairs', 'SECONDARY')
ON DUPLICATE KEY UPDATE description = VALUES(description), variant = VALUES(variant);

INSERT IGNORE INTO user_badges (user_id, badge_id, earned_at)
SELECT u.id, b.id, NOW()
FROM users u, badges b
WHERE u.username = 'testuser' AND b.name IN ('First Repair','Contributor');

INSERT INTO repair_posts (user_id, item_name, issue_description, repair_steps, success, date, created_at)
SELECT u.id, 'Laptop - Dell Inspiron', 'Screen flickering', 'Replaced display cable', true, CURDATE(), NOW()
FROM users u WHERE u.username='testuser'
AND NOT EXISTS (
  SELECT 1 FROM repair_posts rp WHERE rp.item_name = 'Laptop - Dell Inspiron'
);

INSERT INTO repair_posts (user_id, item_name, issue_description, repair_steps, success, date, created_at)
SELECT u.id, 'iPhone 12', 'Battery drain', 'Replaced battery', false, CURDATE(), NOW()
FROM users u WHERE u.username='john_doe'
AND NOT EXISTS (
  SELECT 1 FROM repair_posts rp WHERE rp.item_name = 'iPhone 12'
);

INSERT INTO comments (user_id, repair_post_id, content, date)
SELECT u2.id, rp1.id, 'Great fix! What cable did you use?', NOW()
FROM users u2, repair_posts rp1
WHERE u2.username='john_doe' AND rp1.item_name='Laptop - Dell Inspiron'
AND NOT EXISTS (
  SELECT 1 FROM comments c WHERE c.content = 'Great fix! What cable did you use?'
)
LIMIT 1;

INSERT INTO comments (user_id, repair_post_id, content, date)
SELECT u1.id, rp1.id, 'Thanks! Used a standard LVDS cable.', NOW()
FROM users u1, repair_posts rp1
WHERE u1.username='testuser' AND rp1.item_name='Laptop - Dell Inspiron'
AND NOT EXISTS (
  SELECT 1 FROM comments c WHERE c.content = 'Thanks! Used a standard LVDS cable.'
)
LIMIT 1;

INSERT INTO guides (user_id, item_name, guide_content, date, created_at)
SELECT u1.id, 'Phone Battery Replacement', 'Step 1: Remove back cover...\nStep 2: Disconnect old battery...', CURDATE(), NOW()
FROM users u1 WHERE u1.username='testuser'
AND NOT EXISTS (
  SELECT 1 FROM guides g WHERE g.item_name = 'Phone Battery Replacement'
);

INSERT INTO guides (user_id, item_name, guide_content, date, created_at)
SELECT u2.id, 'Laptop Screen Repair', 'Step 1: Power off device...\nStep 2: Remove bezel...', CURDATE(), NOW()
FROM users u2 WHERE u2.username='john_doe'
AND NOT EXISTS (
  SELECT 1 FROM guides g WHERE g.item_name = 'Laptop Screen Repair'
);

