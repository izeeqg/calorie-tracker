package com.calorie.service;

import java.util.List;

import com.baomidou.mybatisplus.extension.service.IService;
import com.calorie.entity.BaiduRecognitionDetail;

/**
 * 百度AI识别记录详情服务接口
 */
public interface BaiduRecognitionDetailService extends IService<BaiduRecognitionDetail> {

    /**
     * 根据识别记录ID获取详情列表
     * 
     * @param recognitionId 识别记录ID
     * @return 详情列表
     */
    List<BaiduRecognitionDetail> getByRecognitionId(Long recognitionId);
    
    /**
     * 根据识别记录ID获取被选中的详情列表
     * 
     * @param recognitionId 识别记录ID
     * @return 被选中的详情列表
     */
    List<BaiduRecognitionDetail> getSelectedDetails(Long recognitionId);
    
    /**
     * 更新详情的选中状态
     * 
     * @param detailId 详情ID
     * @param selected 是否选中(1-是,0-否)
     * @return 是否成功
     */
    boolean updateSelected(Long detailId, Integer selected);
    
    /**
     * 批量保存识别详情
     * 
     * @param details 详情列表
     * @return 是否成功
     */
    boolean saveBatch(List<BaiduRecognitionDetail> details);
} 