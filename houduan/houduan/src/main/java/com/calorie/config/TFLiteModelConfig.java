package com.calorie.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

/**
 * TensorFlow Lite模型配置
 */
@Data
@Component
@ConfigurationProperties(prefix = "image.recognition.tflite")
public class TFLiteModelConfig {
    
    /**
     * 模型文件路径
     */
    private String modelPath;
    
    /**
     * 标签文件路径
     */
    private String labelsPath;
    
    /**
     * 输入图像宽度
     */
    private int inputWidth = 224;
    
    /**
     * 输入图像高度
     */
    private int inputHeight = 224;
    
    /**
     * 最小置信度阈值(0-1)
     */
    private float confidenceThreshold = 0.6f;
} 