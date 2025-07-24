package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户饮食记录实体类
 */
@Data
@TableName("meal_record")
public class MealRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Integer userId;

    /**
     * 进餐时间
     */
    private LocalDateTime mealTime;

    /**
     * 餐食类型(1-早餐,2-午餐,3-晚餐,4-宵夜,5-零食)
     */
    private Integer mealType;

    /**
     * 总卡路里
     */
    private Integer totalCalories;

    /**
     * 饮食图片URL
     */
    private String imageUrl;

    /**
     * 备注
     */
    private String remark;

    /**
     * 是否通过AI识别(0-否,1-是)
     */
    private Integer aiRecognized;

    /**
     * 关联的识别记录ID
     */
    private Long recognitionId;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 关联的食物列表，非数据库字段
     */
    @TableField(exist = false)
    private List<MealFood> foods;
} 