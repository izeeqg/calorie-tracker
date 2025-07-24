package com.calorie.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

/**
 * 文件上传工具类
 */
@Slf4j
@Component
public class FileUploadUtil {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;
    
    @Value("${file.access.path:/files}")
    private String accessPath;
    
    /**
     * 获取项目根目录
     * 
     * @return 项目根目录
     */
    private String getProjectRootPath() {
        try {
            // 获取当前项目的根目录
            String projectRootPath = new File(".").getAbsolutePath();
            log.info("项目根目录: {}", projectRootPath);
            return projectRootPath;
        } catch (Exception e) {
            log.error("获取项目根目录失败", e);
            return "."; // 如果失败，则使用当前目录
        }
    }
    
    /**
     * 上传图片
     * 
     * @param file 图片文件
     * @param folder 子文件夹
     * @return 访问URL
     * @throws IOException IO异常
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        log.info("开始上传文件，原始文件名: {}, 大小: {}KB", file.getOriginalFilename(), file.getSize() / 1024);
        
        // 获取文件后缀
        String originalFilename = file.getOriginalFilename();
        String suffix = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // 生成文件名
        String uuid = UUID.randomUUID().toString().replaceAll("-", "");
        String fileName = uuid + suffix;
        
        // 生成日期目录，例如：2023/07/10
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        
        // 使用项目根目录
        String rootPath = getProjectRootPath();
        if (rootPath.endsWith(".")) {
            rootPath = rootPath.substring(0, rootPath.length() - 1);
        }
        
        // 完整的目标目录
        String targetDir = rootPath + File.separator + "uploads" + File.separator + folder + File.separator + datePath;
        Path dirPath = Paths.get(targetDir);
        
        log.info("上传目录: {}", dirPath.toAbsolutePath());
        
        try {
            // 确保目录存在
            Files.createDirectories(dirPath);
            
            // 写入文件
            Path targetPath = dirPath.resolve(fileName);
            File targetFile = targetPath.toFile();
            
            log.info("目标文件路径: {}", targetFile.getAbsolutePath());
            
            // 写入文件
            file.transferTo(targetFile);
            
            // 验证文件是否成功写入
            if (!targetFile.exists()) {
                throw new IOException("文件上传失败，文件不存在: " + targetFile.getAbsolutePath());
            }
            
            log.info("文件上传成功: {}", targetFile.getAbsolutePath());
            
            // 返回可访问的URL
            String accessUrl = accessPath + "/" + folder + "/" + datePath + "/" + fileName;
            log.info("文件访问URL: {}", accessUrl);
            return accessUrl;
        } catch (IOException e) {
            log.error("文件上传失败", e);
            // 显示更详细的错误信息
            log.error("目录权限信息 - 目录: {}, 可读: {}, 可写: {}, 绝对路径: {}", 
                dirPath.toString(),
                Files.isReadable(dirPath.getParent()),
                Files.isWritable(dirPath.getParent()),
                dirPath.toAbsolutePath()
            );
            log.error("当前项目目录: {}", new File(".").getAbsolutePath());
            throw e;
        }
    }
} 