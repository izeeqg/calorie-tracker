package com.calorie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.calorie.entity.UserStatistics;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户统计数据Mapper接口
 */
@Mapper
public interface UserStatisticsMapper extends BaseMapper<UserStatistics> {
} 