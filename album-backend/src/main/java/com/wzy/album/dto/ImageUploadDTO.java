package com.wzy.album.dto;

import lombok.Data;

@Data
public class ImageUploadDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String fileType;
    private String description;
    private String uploadTime;
}
