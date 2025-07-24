package com.calorie.dto;

import lombok.Data;

/**
 * 食物数据传输对象
 */
@Data
public class FoodDTO {
    
    /**
     * 食物名称
     */
    private String name;
    
    /**
     * 食物热量(千卡)
     */
    private Integer calories;
    
    /**
     * 百度API返回的原始卡路里字符串
     */
    private String baiduCalorie;
    
    /**
     * 识别概率
     */
    private Float probability;
    
    /**
     * 食物图片URL
     */
    private String imageUrl;
    
    /**
     * 食物描述
     */
    private String description;
} 