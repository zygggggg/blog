-- 创建数据库
CREATE DATABASE IF NOT EXISTS album_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE album_db;

-- 创建相册图片表
CREATE TABLE IF NOT EXISTS album_image (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名（OSS存储的文件名）',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型（MIME类型）',
    description VARCHAR(500) COMMENT '图片描述',
    upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除（0-未删除，1-已删除）',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
    INDEX idx_upload_time (upload_time),
    INDEX idx_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='相册图片表';

-- 迁移现有图片数据（示例数据）
INSERT INTO album_image (file_name, original_name, file_url, file_size, file_type, sort_order, description) VALUES
('pics01.jpg', 'pics01.jpg', '../image/pics01.jpg', 1231358, 'image/jpeg', 1, '示例图片1'),
('pics02.jpg', 'pics02.jpg', '../image/pics02.jpg', 254262, 'image/jpeg', 2, '示例图片2'),
('pics03.jpg', 'pics03.jpg', '../image/pics03.jpg', 831290, 'image/jpeg', 3, '示例图片3'),
('pics04.jpg', 'pics04.jpg', '../image/pics04.jpg', 502743, 'image/jpeg', 4, '示例图片4'),
('pics05.jpg', 'pics05.jpg', '../image/pics05.jpg', 5045378, 'image/jpeg', 5, '示例图片5');
