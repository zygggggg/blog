-- 创建留言板表
CREATE TABLE IF NOT EXISTS board_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    nickname VARCHAR(50) NOT NULL COMMENT '用户昵称',
    content TEXT NOT NULL COMMENT '留言内容',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除（0-未删除，1-已删除）',
    INDEX idx_create_time (create_time),
    INDEX idx_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言板表';
