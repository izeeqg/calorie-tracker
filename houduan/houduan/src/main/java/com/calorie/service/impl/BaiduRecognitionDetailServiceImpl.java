package com.calorie.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calorie.entity.BaiduRecognitionDetail;
import com.calorie.mapper.BaiduRecognitionDetailMapper;
import com.calorie.service.BaiduRecognitionDetailService;

import lombok.extern.slf4j.Slf4j;

/**
 * 百度AI识别记录详情服务实现类
 */
@Slf4j
@Service
public class BaiduRecognitionDetailServiceImpl extends ServiceImpl<BaiduRecognitionDetailMapper, BaiduRecognitionDetail> implements BaiduRecognitionDetailService {

    @Override
    public List<BaiduRecognitionDetail> getByRecognitionId(Long recognitionId) {
        LambdaQueryWrapper<BaiduRecognitionDetail> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BaiduRecognitionDetail::getRecognitionId, recognitionId)
                    .orderByDesc(BaiduRecognitionDetail::getProbability);
        
        return this.list(queryWrapper);
    }

    @Override
    public List<BaiduRecognitionDetail> getSelectedDetails(Long recognitionId) {
        LambdaQueryWrapper<BaiduRecognitionDetail> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BaiduRecognitionDetail::getRecognitionId, recognitionId)
                    .eq(BaiduRecognitionDetail::getSelected, 1)
                    .orderByDesc(BaiduRecognitionDetail::getProbability);
        
        return this.list(queryWrapper);
    }

    @Override
    public boolean updateSelected(Long detailId, Integer selected) {
        LambdaUpdateWrapper<BaiduRecognitionDetail> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(BaiduRecognitionDetail::getId, detailId)
                     .set(BaiduRecognitionDetail::getSelected, selected);
        
        return this.update(updateWrapper);
    }
    
    @Override
    public boolean saveBatch(List<BaiduRecognitionDetail> details) {
        return super.saveBatch(details);
    }
} 