package com.calorie.vo;

import java.util.List;

import com.calorie.dto.FoodDTO;

import lombok.Data;

/**
 * 食物识别结果视图对象
 */
@Data
public class FoodRecognitionVO {
    
    /**
     * 识别是否成功
     */
    private Boolean success;
    
    /**
     * 识别结果消息
     */
    private String message;
    
    /**
     * 识别出的食物列表
     */
    private List<FoodDTO> foods;
} 