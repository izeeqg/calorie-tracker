package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 食物数据实体类
 */
@Data
@TableName("food")
public class Food implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 食物ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 食物名称
     */
    private String name;

    /**
     * 分类ID
     */
    private Integer categoryId;

    /**
     * 每100克卡路里含量
     */
    private Integer calories;

    /**
     * 蛋白质(克/100克)
     */
    private BigDecimal protein;

    /**
     * 脂肪(克/100克)
     */
    private BigDecimal fat;

    /**
     * 碳水化合物(克/100克)
     */
    private BigDecimal carbohydrate;

    /**
     * 纤维素(克/100克)
     */
    private BigDecimal fiber;

    /**
     * 糖分(克/100克)
     */
    private BigDecimal sugar;

    /**
     * 钠(毫克/100克)
     */
    private BigDecimal sodium;

    /**
     * 是否系统数据(0-否，1-是)
     */
    private Integer isSystem;

    /**
     * 食物图片URL
     */
    private String imageUrl;

    /**
     * 食物描述
     */
    private String description;

    /**
     * 百度识别标签（多个标签用逗号分隔）
     */
    private String baiduTags;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
} 