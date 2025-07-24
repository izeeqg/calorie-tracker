package com.calorie.service;

import com.calorie.dto.LoginDTO;
import com.calorie.dto.UserProfileDTO;
import com.calorie.dto.UserSettingsDTO;
import com.calorie.vo.UserInfoVO;

import java.util.Map;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户登录
     *
     * @param loginDTO 登录DTO
     * @return 用户信息
     */
    UserInfoVO login(LoginDTO loginDTO);

    /**
     * 获取用户个人资料
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    UserInfoVO getUserProfile(Integer userId);

    /**
     * 更新用户个人资料
     *
     * @param userId 用户ID
     * @param userProfileDTO 用户资料DTO
     */
    void updateUserProfile(Integer userId, UserProfileDTO userProfileDTO);

    /**
     * 获取用户统计数据
     *
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 统计数据
     */
    Map<String, Object> getUserStatistics(Integer userId, String startDate, String endDate);

    /**
     * 保存用户设置
     *
     * @param userId 用户ID
     * @param userSettingsDTO 用户设置DTO
     */
    void saveUserSettings(Integer userId, UserSettingsDTO userSettingsDTO);

    /**
     * 获取用户设置
     *
     * @param userId 用户ID
     * @return 用户设置
     */
    UserSettingsDTO getUserSettings(Integer userId);
} 