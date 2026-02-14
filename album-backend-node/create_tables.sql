-- 相册图片表
CREATE TABLE IF NOT EXISTS `album_images` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_name` varchar(255) NOT NULL COMMENT '文件名',
  `original_name` varchar(255) NOT NULL COMMENT '原始文件名',
  `file_url` varchar(500) NOT NULL COMMENT '文件URL',
  `file_size` bigint NOT NULL COMMENT '文件大小（字节）',
  `file_type` varchar(50) NOT NULL COMMENT '文件类型（MIME类型）',
  `description` varchar(500) DEFAULT NULL COMMENT '图片描述',
  `upload_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除（0-未删除，1-已删除）',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序顺序',
  PRIMARY KEY (`id`),
  KEY `idx_upload_time` (`upload_time`),
  KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册图片表';

-- 留言板表
CREATE TABLE IF NOT EXISTS `board_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `nickname` varchar(50) NOT NULL COMMENT '用户昵称',
  `content` text NOT NULL COMMENT '留言内容',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除（0-未删除，1-已删除）',
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言板表';
