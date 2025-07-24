package com.calorie.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.InputStream;

/**
 * MinIO文件服务接口
 */
public interface MinioFileService {

    /**
     * 上传文件
     * 
     * @param file 文件
     * @param folder 文件夹路径
     * @return 文件访问URL
     * @throws Exception 异常
     */
    String uploadFile(MultipartFile file, String folder) throws Exception;

    /**
     * 上传文件
     * 
     * @param inputStream 文件输入流
     * @param fileName 文件名
     * @param folder 文件夹路径
     * @param contentType 文件类型
     * @return 文件访问URL
     * @throws Exception 异常
     */
    String uploadFile(InputStream inputStream, String fileName, String folder, String contentType) throws Exception;

    /**
     * 从本地文件上传
     * 
     * @param localFile 本地文件
     * @param folder 文件夹路径
     * @return 文件访问URL
     * @throws Exception 异常
     */
    String uploadLocalFile(File localFile, String folder) throws Exception;

    /**
     * 删除文件
     * 
     * @param objectName 对象名称（完整路径）
     * @throws Exception 异常
     */
    void deleteFile(String objectName) throws Exception;

    /**
     * 判断文件是否存在
     * 
     * @param objectName 对象名称
     * @return 是否存在
     */
    boolean fileExists(String objectName);

    /**
     * 获取文件访问URL
     * 
     * @param objectName 对象名称
     * @return 文件访问URL
     */
    String getFileUrl(String objectName);
} 