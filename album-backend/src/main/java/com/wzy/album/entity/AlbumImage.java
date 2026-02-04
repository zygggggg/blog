package com.wzy.album.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("album_image")
public class AlbumImage {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String fileName;

    private String originalName;

    private String fileUrl;

    private Long fileSize;

    private String fileType;

    private String description;

    private LocalDateTime uploadTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;

    private Integer sortOrder;
}
