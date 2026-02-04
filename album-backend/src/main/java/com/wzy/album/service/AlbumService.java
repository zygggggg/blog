package com.wzy.album.service;

import com.wzy.album.dto.ImageListDTO;
import com.wzy.album.dto.ImageUploadDTO;
import org.springframework.web.multipart.MultipartFile;

public interface AlbumService {

    /**
     * 上传图片
     */
    ImageUploadDTO uploadImage(MultipartFile file, String description);

    /**
     * 获取图片列表
     */
    ImageListDTO getImageList(Integer page, Integer size);

    /**
     * 删除图片
     */
    void deleteImage(Long id);
}
