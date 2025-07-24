package com.calorie.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 用户饮食记录统计信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMealStats {
    
    /**
     * 用户ID
     */
    private Integer userId;
    
    /**
     * 总记录天数
     */
    private Integer recordDays;
    
    /**
     * 总记录条数
     */
    private Integer totalRecords;
    
    /**
     * 总卡路里摄入
     */
    private Integer totalCalories;
    
    /**
     * 本周卡路里摄入
     */
    private Integer weekCalories;
} 