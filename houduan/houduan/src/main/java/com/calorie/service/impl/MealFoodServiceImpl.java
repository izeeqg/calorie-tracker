package com.calorie.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calorie.entity.MealFood;
import com.calorie.mapper.MealFoodMapper;
import com.calorie.service.MealFoodService;

import lombok.extern.slf4j.Slf4j;

/**
 * 饮食记录详情服务实现类
 */
@Slf4j
@Service
public class MealFoodServiceImpl extends ServiceImpl<MealFoodMapper, MealFood> implements MealFoodService {

    @Override
    public List<MealFood> getByMealId(Long mealId) {
        LambdaQueryWrapper<MealFood> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(MealFood::getMealId, mealId);
        
        return this.list(queryWrapper);
    }
    
    @Override
    public boolean saveBatch(List<MealFood> mealFoods) {
        return super.saveBatch(mealFoods);
    }
} 