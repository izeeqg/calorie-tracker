package com.calorie.controller;

import com.calorie.common.CommonResult;
import com.calorie.entity.MealRecord;
import com.calorie.entity.UserMealStats;
import com.calorie.service.MealRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 饮食记录控制器
 */
@Slf4j
@RestController
@RequestMapping("/meal")
public class MealController {

    @Autowired
    private MealRecordService mealRecordService;

    /**
     * 获取用户特定日期的饮食记录
     *
     * @param request HTTP请求对象
     * @param date   日期字符串(yyyy-MM-dd)
     * @return 饮食记录列表
     */
    @GetMapping("/date/{date}")
    public CommonResult<List<MealRecord>> getUserMealsByDate(
            HttpServletRequest request,
            @PathVariable("date") String date) {
        try {
            Integer userId = (Integer) request.getAttribute("userId");
            log.info("获取用户{}的{}日饮食记录", userId, date);
            List<MealRecord> records = mealRecordService.getUserMealsByDate(userId, date);
            
            // 增加详细日志
            log.info("查询结果：用户{}在{}共有{}条记录", userId, date, records.size());
            if (!records.isEmpty()) {
                records.forEach(record -> {
                    log.info("记录详情：ID={}, 餐食类型={}, 卡路里={}, 用餐时间={}", 
                            record.getId(), record.getMealType(), record.getTotalCalories(), record.getMealTime());
                });
                int totalCalories = records.stream()
                        .mapToInt(record -> record.getTotalCalories() != null ? record.getTotalCalories() : 0)
                        .sum();
                log.info("今日总卡路里计算结果：{}", totalCalories);
            }
            
            return CommonResult.success(records);
        } catch (Exception e) {
            log.error("获取用户饮食记录失败", e);
            return CommonResult.failed("获取记录失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户最近的饮食记录
     *
     * @param request HTTP请求对象
     * @param limit  限制数量
     * @return 饮食记录列表
     */
    @GetMapping("/recent")
    public CommonResult<List<MealRecord>> getRecentMeals(
            HttpServletRequest request,
            @RequestParam(value = "limit", defaultValue = "10") Integer limit) {
        try {
            Integer userId = (Integer) request.getAttribute("userId");
            log.info("获取用户{}的最近{}条饮食记录", userId, limit);
            List<MealRecord> records = mealRecordService.getRecentMeals(userId, limit);
            return CommonResult.success(records);
        } catch (Exception e) {
            log.error("获取用户最近饮食记录失败", e);
            return CommonResult.failed("获取记录失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取饮食记录详情
     *
     * @param id 记录ID
     * @return 饮食记录详情，包含食物列表
     */
    @GetMapping("/{id}")
    public CommonResult<MealRecord> getMealById(@PathVariable("id") Long id) {
        try {
            log.info("获取饮食记录详情，ID: {}", id);
            // 使用新的getMealDetailById方法获取包含食物列表的详情
            MealRecord record = mealRecordService.getMealDetailById(id);
            if (record == null) {
                return CommonResult.failed("记录不存在");
            }
            return CommonResult.success(record);
        } catch (Exception e) {
            log.error("获取饮食记录详情失败", e);
            return CommonResult.failed("获取详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户饮食记录统计信息
     *
     * @param request HTTP请求对象
     * @return 用户饮食统计信息
     */
    @GetMapping("/stats")
    public CommonResult<UserMealStats> getUserMealStats(HttpServletRequest request) {
        try {
            Integer userId = (Integer) request.getAttribute("userId");
            log.info("获取用户{}的饮食统计信息", userId);
            UserMealStats stats = mealRecordService.getUserMealStats(userId);
            return CommonResult.success(stats);
        } catch (Exception e) {
            log.error("获取用户饮食统计信息失败", e);
            return CommonResult.failed("获取统计信息失败: " + e.getMessage());
        }
    }
} 