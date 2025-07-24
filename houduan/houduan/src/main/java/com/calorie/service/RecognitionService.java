package com.calorie.service;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.multipart.MultipartFile;

import com.calorie.vo.FoodRecognitionVO;
import com.calorie.vo.RecognitionResultVO;

import java.util.List;

/**
 * 图像识别服务接口
 */
public interface RecognitionService {

    /**
     * 识别图片
     *
     * @param file 图片文件
     * @return 识别结果
     */
    RecognitionResultVO recognizeImage(MultipartFile file);

    /**
     * 获取识别结果
     *
     * @param id 识别记录ID
     * @return 识别结果
     */
    RecognitionResultVO getRecognitionResult(Long id);

    /**
     * 获取历史识别记录
     *
     * @param page 页码
     * @param size 每页大小
     * @return 历史记录列表
     */
    List<RecognitionResultVO> getHistoryRecords(Integer page, Integer size);

    /**
     * 图像识别食物
     * 
     * @param file 图片文件
     * @return 食物识别结果
     */
    FoodRecognitionVO recognizeFood(MultipartFile file);
    
    /**
     * 从文件路径识别食物
     * 
     * @param filePath 图片文件路径
     * @return 食物识别结果
     */
    FoodRecognitionVO recognizeFoodFromPath(String filePath);

    /**
     * 保存识别记录
     * 
     * @param request HTTP请求对象
     * @param imageUrl 图片URL
     * @param foodName 食物名称
     * @param userId 用户ID
     * @return 记录ID
     */
    long saveRecord(HttpServletRequest request, String imageUrl, String foodName, String userId);
} 