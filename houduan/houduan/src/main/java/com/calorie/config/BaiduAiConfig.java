package com.calorie.config;

import com.baidu.aip.imageclassify.AipImageClassify;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 百度AI平台配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "image.recognition.baidu")
public class BaiduAiConfig {
    
    private String appId;
    private String apiKey;
    private String secretKey;

    /**
     * 创建图像识别客户端
     */
    @Bean
    public AipImageClassify aipImageClassify() {
        AipImageClassify client = new AipImageClassify(appId, apiKey, secretKey);
        
        // 设置连接超时时间为10秒
        client.setConnectionTimeoutInMillis(10000);
        // 设置读取超时时间为30秒
        client.setSocketTimeoutInMillis(30000);
        
        return client;
    }
} 