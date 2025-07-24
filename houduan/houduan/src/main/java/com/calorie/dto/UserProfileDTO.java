package com.calorie.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 用户资料数据传输对象
 */
@Data
public class UserProfileDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户昵称
     */
    private String nickname;

    /**
     * 头像URL
     */
    private String avatarUrl;

    /**
     * 性别(0-未知，1-男，2-女)
     */
    @Min(value = 0, message = "性别值必须在0-2之间")
    @Max(value = 2, message = "性别值必须在0-2之间")
    private Integer gender;

    /**
     * 年龄
     */
    @Min(value = 1, message = "年龄必须大于0")
    @Max(value = 120, message = "年龄不能超过120")
    private Integer age;

    /**
     * 身高(cm)
     */
    @Min(value = 50, message = "身高必须大于50cm")
    @Max(value = 250, message = "身高不能超过250cm")
    private BigDecimal height;

    /**
     * 体重(kg)
     */
    @Min(value = 20, message = "体重必须大于20kg")
    @Max(value = 300, message = "体重不能超过300kg")
    private BigDecimal weight;

    /**
     * 目标每日卡路里摄入量
     */
    @Min(value = 500, message = "目标卡路里不能低于500")
    @Max(value = 10000, message = "目标卡路里不能超过10000")
    private Integer targetCalories;
} 