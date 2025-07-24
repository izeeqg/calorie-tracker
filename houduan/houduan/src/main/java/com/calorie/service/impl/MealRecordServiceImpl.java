package com.calorie.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calorie.entity.BaiduRecognitionDetail;
import com.calorie.entity.MealFood;
import com.calorie.entity.MealRecord;
import com.calorie.entity.UserMealStats;
import com.calorie.mapper.MealRecordMapper;
import com.calorie.service.MealFoodService;
import com.calorie.service.MealRecordService;

import lombok.extern.slf4j.Slf4j;

/**
 * 饮食记录服务实现类
 */
@Slf4j
@Service
public class MealRecordServiceImpl extends ServiceImpl<MealRecordMapper, MealRecord> implements MealRecordService {

    @Autowired
    private MealFoodService mealFoodService;
    
    @Override
    public List<MealRecord> getUserMealsByDate(Integer userId, String date) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        LocalDateTime startTime = localDate.atStartOfDay();
        LocalDateTime endTime = localDate.plusDays(1).atStartOfDay();
        
        LambdaQueryWrapper<MealRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(MealRecord::getUserId, userId)
                    .ge(MealRecord::getMealTime, startTime)
                    .lt(MealRecord::getMealTime, endTime)
                    .orderByAsc(MealRecord::getMealTime);
        
        return this.list(queryWrapper);
    }

    @Override
    public List<MealRecord> getRecentMeals(Integer userId, Integer limit) {
        LambdaQueryWrapper<MealRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(MealRecord::getUserId, userId)
                    .orderByDesc(MealRecord::getCreatedAt)
                    .last("LIMIT " + limit);
        
        return this.list(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveMealWithFoods(MealRecord mealRecord, List<BaiduRecognitionDetail> details) {
        // 1. 保存饮食记录
        this.save(mealRecord);
        
        // 2. 保存饮食食物详情
        if (details != null && !details.isEmpty()) {
            List<MealFood> mealFoods = new ArrayList<>();
            
            for (BaiduRecognitionDetail detail : details) {
                MealFood mealFood = new MealFood();
                mealFood.setMealId(mealRecord.getId());
                // 这里假设食物ID不可用，使用0代替，实际应用中应该从数据库查询或映射表获取
                mealFood.setFoodId(0);
                mealFood.setFoodName(detail.getFoodName());
                // 默认100克
                mealFood.setPortion(new java.math.BigDecimal("100"));
                mealFood.setCalories(detail.getCalories());
                mealFood.setRecognitionConfidence(detail.getProbability());
                
                mealFoods.add(mealFood);
            }
            
            mealFoodService.saveBatch(mealFoods);
        }
        
        return mealRecord.getId();
    }
    
    @Override
    public UserMealStats getUserMealStats(Integer userId) {
        log.info("获取用户{}的饮食统计信息", userId);
        
        // 查询用户所有饮食记录
        LambdaQueryWrapper<MealRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(MealRecord::getUserId, userId);
        List<MealRecord> allRecords = this.list(queryWrapper);
        
        if (allRecords.isEmpty()) {
            // 如果没有记录，返回默认值
            return UserMealStats.builder()
                    .userId(userId)
                    .recordDays(0)
                    .totalRecords(0)
                    .totalCalories(0)
                    .weekCalories(0)
                    .build();
        }
        
        // 计算总卡路里
        int totalCalories = allRecords.stream()
                .mapToInt(record -> record.getTotalCalories() != null ? record.getTotalCalories() : 0)
                .sum();
        
        // 计算本周卡路里
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1); // 本周一
        LocalDateTime weekStartTime = weekStart.atStartOfDay();
        
        int weekCalories = allRecords.stream()
                .filter(record -> record.getMealTime() != null && record.getMealTime().isAfter(weekStartTime))
                .mapToInt(record -> record.getTotalCalories() != null ? record.getTotalCalories() : 0)
                .sum();
        
        // 计算记录天数（按用餐日期分组计数）
        int recordDays = allRecords.stream()
                .filter(record -> record.getMealTime() != null)
                .map(record -> record.getMealTime().toLocalDate())
                .collect(Collectors.toSet())
                .size();
        
        // 构建并返回结果
        return UserMealStats.builder()
                .userId(userId)
                .recordDays(recordDays)
                .totalRecords(allRecords.size())
                .totalCalories(totalCalories)
                .weekCalories(weekCalories)
                .build();
    }
    
    @Override
    public MealRecord getMealDetailById(Long id) {
        log.info("获取饮食记录详情，ID: {}", id);
        
        // 获取饮食记录基本信息
        MealRecord record = this.getById(id);
        if (record == null) {
            log.warn("未找到ID为{}的饮食记录", id);
            return null;
        }
        
        // 获取该记录的食物列表
        List<MealFood> foodList = mealFoodService.getByMealId(id);
        
        // 将食物列表添加到记录对象的附加字段中
        // 注意：这里需要在MealRecord类中添加一个transient字段
        // 此处假设已添加该字段，实际开发时请确保已添加
        record.setFoods(foodList);
        
        log.info("饮食记录详情查询成功，ID: {}，包含{}种食物", id, foodList.size());
        return record;
    }
} 