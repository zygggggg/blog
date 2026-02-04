package com.wzy.album.controller;

import com.wzy.album.common.Result;
import com.wzy.album.dto.ImageListDTO;
import com.wzy.album.dto.ImageUploadDTO;
import com.wzy.album.service.AlbumService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/album")
public class AlbumController {

    @Autowired
    private AlbumService albumService;

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("Album service is running");
    }

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public Result<ImageUploadDTO> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {
        log.info("Upload image request received, filename: {}", file.getOriginalFilename());
        ImageUploadDTO result = albumService.uploadImage(file, description);
        return Result.success("上传成功", result);
    }

    /**
     * 获取图片列表
     */
    @GetMapping("/list")
    public Result<ImageListDTO> getImageList(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "20") Integer size) {
        log.info("Get image list request received, page: {}, size: {}", page, size);
        ImageListDTO result = albumService.getImageList(page, size);
        return Result.success(result);
    }

    /**
     * 删除图片
     */
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteImage(@PathVariable Long id) {
        log.info("Delete image request received, id: {}", id);
        albumService.deleteImage(id);
        return Result.success("删除成功", null);
    }
}
