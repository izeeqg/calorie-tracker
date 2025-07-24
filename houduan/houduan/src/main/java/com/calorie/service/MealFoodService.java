package com.calorie.service;

import java.util.List;

import com.baomidou.mybatisplus.extension.service.IService;
import com.calorie.entity.MealFood;

/**
 * 饮食记录详情服务接口
 */
public interface MealFoodService extends IService<MealFood> {

    /**
     * 根据饮食记录ID获取详情
     * 
     * @param mealId 饮食记录ID
     * @return 详情列表
     */
    List<MealFood> getByMealId(Long mealId);
    
    /**
     * 批量保存饮食食物详情
     * 
     * @param mealFoods 详情列表
     * @return 是否成功
     */
    boolean saveBatch(List<MealFood> mealFoods);
} 