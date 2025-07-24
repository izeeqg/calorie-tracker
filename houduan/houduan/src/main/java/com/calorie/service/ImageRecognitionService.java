package com.calorie.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.calorie.entity.ImageRecognition;
import com.calorie.vo.FoodRecognitionVO;

/**
 * 图像识别记录服务接口
 */
public interface ImageRecognitionService extends IService<ImageRecognition> {

    /**
     * 保存识别结果到数据库
     * 
     * @param recognition 识别记录基本信息
     * @param result 识别结果
     * @return 记录ID
     */
    Long saveRecognitionResult(ImageRecognition recognition, FoodRecognitionVO result);
    
    /**
     * 根据用户ID获取最近的识别记录
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 识别记录列表
     */
    java.util.List<ImageRecognition> getRecentRecords(Integer userId, Integer limit);
} 