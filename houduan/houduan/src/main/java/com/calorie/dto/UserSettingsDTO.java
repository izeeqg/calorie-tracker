package com.calorie.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.io.Serializable;

/**
 * 用户设置数据传输对象
 */
@Data
public class UserSettingsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 目标每日卡路里摄入量
     */
    @Min(value = 500, message = "目标卡路里不能低于500")
    @Max(value = 10000, message = "目标卡路里不能超过10000")
    private Integer targetCalories;

    /**
     * 是否开启提醒
     */
    private Boolean reminderEnabled;

    /**
     * 早餐提醒时间（格式：HH:mm）
     */
    private String breakfastReminderTime;

    /**
     * 午餐提醒时间（格式：HH:mm）
     */
    private String lunchReminderTime;

    /**
     * 晚餐提醒时间（格式：HH:mm）
     */
    private String dinnerReminderTime;
} 