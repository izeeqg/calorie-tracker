package com.calorie.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calorie.dto.FoodDTO;
import com.calorie.entity.BaiduRecognitionDetail;
import com.calorie.entity.ImageRecognition;
import com.calorie.mapper.ImageRecognitionMapper;
import com.calorie.service.BaiduRecognitionDetailService;
import com.calorie.service.ImageRecognitionService;
import com.calorie.vo.FoodRecognitionVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 图像识别记录服务实现类
 */
@Slf4j
@Service
public class ImageRecognitionServiceImpl extends ServiceImpl<ImageRecognitionMapper, ImageRecognition> implements ImageRecognitionService {

    @Autowired
    private BaiduRecognitionDetailService baiduDetailService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveRecognitionResult(ImageRecognition recognition, FoodRecognitionVO result) {
        // 1. 构建识别结果JSON
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("success", result.getSuccess());
        resultMap.put("message", result.getMessage());
        resultMap.put("foodCount", result.getFoods().size());
        recognition.setRecognitionResult(resultMap);
        
        // 2. 保存识别记录
        this.save(recognition);
        
        // 3. 保存识别详情
        if (result.getFoods() != null && !result.getFoods().isEmpty()) {
            List<BaiduRecognitionDetail> details = new ArrayList<>();
            
            for (FoodDTO food : result.getFoods()) {
                BaiduRecognitionDetail detail = new BaiduRecognitionDetail();
                detail.setRecognitionId(recognition.getId());
                detail.setFoodName(food.getName());
                detail.setProbability(java.math.BigDecimal.valueOf(food.getProbability()));
                detail.setCalories(food.getCalories());
                // 保存百度API返回的原始卡路里字符串
                detail.setBaiduCalorie(food.getBaiduCalorie()); 
                detail.setImageUrl(food.getImageUrl());
                detail.setDescription(food.getDescription());
                detail.setSelected(1); // 默认选中
                details.add(detail);
            }
            
            baiduDetailService.saveBatch(details);
        }
        
        return recognition.getId();
    }

    @Override
    public List<ImageRecognition> getRecentRecords(Integer userId, Integer limit) {
        LambdaQueryWrapper<ImageRecognition> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ImageRecognition::getUserId, userId)
                    .eq(ImageRecognition::getStatus, 1) // 成功的记录
                    .orderByDesc(ImageRecognition::getCreatedAt)
                    .last("LIMIT " + limit);
        
        return this.list(queryWrapper);
    }
} 