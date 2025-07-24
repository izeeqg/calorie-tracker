package com.calorie.vo;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

/**
 * 识别结果视图对象
 */
@Data
public class RecognitionResultVO {
    
    /**
     * 记录ID
     */
    private Long id;
    
    /**
     * 图片URL
     */
    private String imageUrl;
    
    /**
     * 食物名称
     */
    private String foodName;
    
    /**
     * 识别状态
     */
    private String status;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 总卡路里
     */
    private Integer totalCalories;
} 