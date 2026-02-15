-- 添加avatar字段到board_messages表
ALTER TABLE board_messages
ADD COLUMN avatar VARCHAR(255) DEFAULT NULL COMMENT '用户头像URL' AFTER content;
