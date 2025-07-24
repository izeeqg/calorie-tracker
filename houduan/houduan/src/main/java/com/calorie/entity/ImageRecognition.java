package com.calorie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 图片识别记录实体类
 */
@Data
@TableName(value = "image_recognition", autoResultMap = true)
public class ImageRecognition implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 识别记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Integer userId;

    /**
     * 图片URL
     */
    private String imageUrl;

    /**
     * 识别结果JSON
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> recognitionResult;
    
    /**
     * 识别提供商(baidu,tflite等)
     */
    private String provider;

    /**
     * 状态(0-处理中,1-成功,2-失败)
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
} 