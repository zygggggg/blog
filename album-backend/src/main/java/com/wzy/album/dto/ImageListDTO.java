package com.wzy.album.dto;

import lombok.Data;

import java.util.List;

@Data
public class ImageListDTO {
    private Long total;
    private Integer page;
    private Integer size;
    private List<ImageUploadDTO> list;
}
