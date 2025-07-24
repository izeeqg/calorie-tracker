package com.calorie.config;

import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

/**
 * MinIO配置类
 */
@Configuration
public class MinioConfig {

    /**
     * MinIO属性配置
     */
    @Data
    @Component
    @ConfigurationProperties(prefix = "minio")
    public static class MinioProperties {
        
        /**
         * MinIO服务器端点
         */
        private String endpoint;
        
        /**
         * 访问密钥
         */
        private String accessKey;
        
        /**
         * 密钥
         */
        private String secretKey;
        
        /**
         * 桶名称
         */
        private String bucketName;
        
        /**
         * 外部访问域名
         */
        private String domain;
    }

    /**
     * 创建MinIO客户端Bean
     * 
     * @param properties MinIO属性配置
     * @return MinIO客户端
     */
    @Bean
    public MinioClient minioClient(MinioProperties properties) {
        return MinioClient.builder()
                .endpoint(properties.getEndpoint())
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }
} 