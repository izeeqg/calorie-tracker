package com.calorie.service.impl;

import com.calorie.config.MinioConfig;
import com.calorie.service.MinioFileService;
import io.minio.*;
import io.minio.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * MinIO文件服务实现类
 */
@Slf4j
@Service
public class MinioFileServiceImpl implements MinioFileService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private MinioConfig.MinioProperties minioProperties;

    /**
     * 初始化，确保桶存在
     */
    @PostConstruct
    public void init() {
        try {
            // 检查桶是否存在，不存在则创建
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .build()
            );
            
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(minioProperties.getBucketName())
                                .build()
                );
                log.info("创建MinIO桶成功: {}", minioProperties.getBucketName());
            } else {
                log.info("MinIO桶已存在: {}", minioProperties.getBucketName());
            }
        } catch (Exception e) {
            log.error("初始化MinIO桶失败", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        String objectName = buildObjectName(originalFilename, folder);
        
        log.info("上传文件到MinIO: {} -> {}", originalFilename, objectName);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            
            String fileUrl = getFileUrl(objectName);
            log.info("文件上传成功，访问URL: {}", fileUrl);
            return fileUrl;
        }
    }

    @Override
    public String uploadFile(InputStream inputStream, String fileName, String folder, String contentType) throws Exception {
        String objectName = buildObjectName(fileName, folder);
        
        log.info("上传流文件到MinIO: {} -> {}", fileName, objectName);

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(minioProperties.getBucketName())
                        .object(objectName)
                        .stream(inputStream, -1, 10485760) // 10MB分片大小
                        .contentType(contentType)
                        .build()
        );
        
        String fileUrl = getFileUrl(objectName);
        log.info("流文件上传成功，访问URL: {}", fileUrl);
        return fileUrl;
    }

    @Override
    public String uploadLocalFile(File localFile, String folder) throws Exception {
        if (!localFile.exists()) {
            throw new IllegalArgumentException("本地文件不存在: " + localFile.getAbsolutePath());
        }

        String fileName = localFile.getName();
        String objectName = buildObjectName(fileName, folder);
        
        log.info("上传本地文件到MinIO: {} -> {}", localFile.getAbsolutePath(), objectName);

        try (FileInputStream inputStream = new FileInputStream(localFile)) {
            String contentType = getContentType(fileName);
            
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .stream(inputStream, localFile.length(), -1)
                            .contentType(contentType)
                            .build()
            );
            
            String fileUrl = getFileUrl(objectName);
            log.info("本地文件上传成功，访问URL: {}", fileUrl);
            return fileUrl;
        }
    }

    @Override
    public void deleteFile(String objectName) throws Exception {
        log.info("删除MinIO文件: {}", objectName);
        
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(minioProperties.getBucketName())
                        .object(objectName)
                        .build()
        );
        
        log.info("文件删除成功: {}", objectName);
    }

    @Override
    public boolean fileExists(String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getFileUrl(String objectName) {
        return minioProperties.getDomain() + "/" + minioProperties.getBucketName() + "/" + objectName;
    }

    /**
     * 构建对象名称（包含路径）
     * 
     * @param originalFilename 原始文件名
     * @param folder 文件夹
     * @return 对象名称
     */
    private String buildObjectName(String originalFilename, String folder) {
        // 获取文件后缀
        String suffix = "";
        if (StringUtils.hasText(originalFilename) && originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // 生成UUID文件名
        String fileName = UUID.randomUUID().toString().replaceAll("-", "") + suffix;
        
        // 生成日期目录，例如：2025/01/11
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        
        // 构建完整对象名称
        StringBuilder objectName = new StringBuilder();
        if (StringUtils.hasText(folder)) {
            objectName.append(folder).append("/");
        }
        objectName.append(datePath).append("/").append(fileName);
        
        return objectName.toString();
    }

    /**
     * 根据文件名获取Content-Type
     * 
     * @param fileName 文件名
     * @return Content-Type
     */
    private String getContentType(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return "application/octet-stream";
        }
        
        String lowerCaseFileName = fileName.toLowerCase();
        if (lowerCaseFileName.endsWith(".jpg") || lowerCaseFileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerCaseFileName.endsWith(".png")) {
            return "image/png";
        } else if (lowerCaseFileName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerCaseFileName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (lowerCaseFileName.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "application/octet-stream";
        }
    }
} 