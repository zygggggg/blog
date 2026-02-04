package com.wzy.album.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.PutObjectRequest;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wzy.album.config.OssConfig;
import com.wzy.album.dto.ImageListDTO;
import com.wzy.album.dto.ImageUploadDTO;
import com.wzy.album.entity.AlbumImage;
import com.wzy.album.exception.BusinessException;
import com.wzy.album.mapper.AlbumImageMapper;
import com.wzy.album.service.AlbumService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AlbumServiceImpl implements AlbumService {

    @Autowired
    private AlbumImageMapper albumImageMapper;

    @Autowired
    private OSS ossClient;

    @Autowired
    private OssConfig ossConfig;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Override
    public ImageUploadDTO uploadImage(MultipartFile file, String description) {
        // 验证文件
        validateFile(file);

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString().replace("-", "") + extension;
        String ossKey = ossConfig.getFolder() + fileName;

        try {
            // 上传到 OSS
            InputStream inputStream = file.getInputStream();
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossConfig.getBucketName(),
                    ossKey,
                    inputStream
            );
            ossClient.putObject(putObjectRequest);
            inputStream.close();

            // 构建文件 URL
            String fileUrl = ossConfig.getUrlPrefix() + ossKey;

            // 保存到数据库
            AlbumImage albumImage = new AlbumImage();
            albumImage.setFileName(fileName);
            albumImage.setOriginalName(originalFilename);
            albumImage.setFileUrl(fileUrl);
            albumImage.setFileSize(file.getSize());
            albumImage.setFileType(file.getContentType());
            albumImage.setDescription(description);
            albumImage.setUploadTime(LocalDateTime.now());
            albumImage.setUpdateTime(LocalDateTime.now());
            albumImage.setIsDeleted(0);
            albumImage.setSortOrder(0);

            albumImageMapper.insert(albumImage);

            // 返回结果
            ImageUploadDTO result = new ImageUploadDTO();
            BeanUtils.copyProperties(albumImage, result);
            result.setUploadTime(albumImage.getUploadTime().format(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            ));

            log.info("Image uploaded successfully: {}", fileName);
            return result;

        } catch (IOException e) {
            log.error("Failed to upload image: ", e);
            throw new BusinessException("文件上传失败");
        }
    }

    @Override
    public ImageListDTO getImageList(Integer page, Integer size) {
        if (page == null || page < 1) {
            page = 1;
        }
        if (size == null || size < 1) {
            size = 20;
        }

        Page<AlbumImage> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AlbumImage> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AlbumImage::getIsDeleted, 0)
                .orderByDesc(AlbumImage::getSortOrder)
                .orderByDesc(AlbumImage::getUploadTime);

        IPage<AlbumImage> pageResult = albumImageMapper.selectPage(pageParam, queryWrapper);

        ImageListDTO result = new ImageListDTO();
        result.setTotal(pageResult.getTotal());
        result.setPage(page);
        result.setSize(size);

        List<ImageUploadDTO> list = pageResult.getRecords().stream().map(image -> {
            ImageUploadDTO dto = new ImageUploadDTO();
            BeanUtils.copyProperties(image, dto);
            dto.setUploadTime(image.getUploadTime().format(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            ));
            return dto;
        }).collect(Collectors.toList());

        result.setList(list);
        return result;
    }

    @Override
    public void deleteImage(Long id) {
        AlbumImage image = albumImageMapper.selectById(id);
        if (image == null) {
            throw new BusinessException("图片不存在");
        }

        try {
            // 从 OSS 删除
            String ossKey = ossConfig.getFolder() + image.getFileName();
            ossClient.deleteObject(ossConfig.getBucketName(), ossKey);

            // 从数据库删除（逻辑删除）
            albumImageMapper.deleteById(id);

            log.info("Image deleted successfully: {}", image.getFileName());
        } catch (Exception e) {
            log.error("Failed to delete image: ", e);
            throw new BusinessException("删除图片失败");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "文件不能为空");
        }

        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(400, "文件大小不能超过10MB");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException(400, "只支持 JPG、PNG、GIF、WEBP 格式的图片");
        }

        // 验证文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BusinessException(400, "文件名不合法");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        List<String> allowedExtensions = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");
        if (!allowedExtensions.contains(extension)) {
            throw new BusinessException(400, "只支持 JPG、PNG、GIF、WEBP 格式的图片");
        }
    }
}
