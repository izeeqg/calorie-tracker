package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 菜品百度标签映射实体类
 */
@Data
@TableName("baidu_food_mapping")
public class BaiduFoodMapping implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 映射ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 百度识别标签
     */
    private String baiduTag;

    /**
     * 关联的食物ID
     */
    private Integer foodId;

    /**
     * 优先级(数字越小优先级越高)
     */
    private Integer priority;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 