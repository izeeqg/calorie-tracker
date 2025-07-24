package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 百度AI识别记录详情实体类
 */
@Data
@TableName("baidu_recognition_detail")
public class BaiduRecognitionDetail implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联的识别记录ID
     */
    private Long recognitionId;

    /**
     * 识别的食物名称
     */
    private String foodName;

    /**
     * 识别置信度
     */
    private BigDecimal probability;

    /**
     * 匹配的卡路里值
     */
    private Integer calories;

    /**
     * 百度API返回的原始卡路里值
     */
    private String baiduCalorie;

    /**
     * 百科图片URL
     */
    private String imageUrl;

    /**
     * 百科描述
     */
    private String description;

    /**
     * 是否被用户选中(0-否,1-是)
     */
    private Integer selected;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 