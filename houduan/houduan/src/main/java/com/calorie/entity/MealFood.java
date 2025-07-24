package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 饮食记录详情实体类
 */
@Data
@TableName("meal_food")
public class MealFood implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 饮食记录ID
     */
    private Long mealId;

    /**
     * 食物ID
     */
    private Integer foodId;

    /**
     * 食物名称(冗余)
     */
    private String foodName;

    /**
     * 食用份量(克)
     */
    private BigDecimal portion;

    /**
     * 卡路里含量
     */
    private Integer calories;

    /**
     * 识别置信度
     */
    private BigDecimal recognitionConfidence;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 