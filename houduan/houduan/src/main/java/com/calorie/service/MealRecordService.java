package com.calorie.service;

import java.util.List;

import com.baomidou.mybatisplus.extension.service.IService;
import com.calorie.entity.BaiduRecognitionDetail;
import com.calorie.entity.MealRecord;
import com.calorie.entity.UserMealStats;

/**
 * 饮食记录服务接口
 */
public interface MealRecordService extends IService<MealRecord> {

    /**
     * 根据用户ID和日期获取饮食记录
     * 
     * @param userId 用户ID
     * @param date 日期字符串(yyyy-MM-dd)
     * @return 饮食记录列表
     */
    List<MealRecord> getUserMealsByDate(Integer userId, String date);
    
    /**
     * 根据用户ID获取最近的饮食记录
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 饮食记录列表
     */
    List<MealRecord> getRecentMeals(Integer userId, Integer limit);
    
    /**
     * 保存饮食记录及食物详情
     * 
     * @param mealRecord 饮食记录
     * @param details 百度识别详情列表
     * @return 记录ID
     */
    Long saveMealWithFoods(MealRecord mealRecord, List<BaiduRecognitionDetail> details);
    
    /**
     * 获取用户饮食记录统计信息
     * 
     * @param userId 用户ID
     * @return 用户饮食统计信息
     */
    UserMealStats getUserMealStats(Integer userId);
    
    /**
     * 根据ID获取饮食记录详情，包含食物列表
     * 
     * @param id 记录ID
     * @return 包含食物列表的饮食记录
     */
    MealRecord getMealDetailById(Long id);
} 