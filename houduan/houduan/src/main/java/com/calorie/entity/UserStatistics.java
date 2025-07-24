package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户数据统计实体类
 */
@Data
@TableName("user_statistics")
public class UserStatistics implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 统计ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Integer userId;

    /**
     * 统计日期
     */
    private LocalDate date;

    /**
     * 总卡路里
     */
    private Integer totalCalories;

    /**
     * 早餐卡路里
     */
    private Integer breakfastCalories;

    /**
     * 午餐卡路里
     */
    private Integer lunchCalories;

    /**
     * 晚餐卡路里
     */
    private Integer dinnerCalories;

    /**
     * 宵夜卡路里
     */
    private Integer midnightSnackCalories;

    /**
     * 零食卡路里
     */
    private Integer snackCalories;

    /**
     * 蛋白质总量(克)
     */
    private BigDecimal protein;

    /**
     * 脂肪总量(克)
     */
    private BigDecimal fat;

    /**
     * 碳水化合物总量(克)
     */
    private BigDecimal carbohydrate;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
} 