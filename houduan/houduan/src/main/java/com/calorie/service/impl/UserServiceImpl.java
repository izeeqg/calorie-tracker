package com.calorie.service.impl;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.calorie.common.Constants;
import com.calorie.dto.LoginDTO;
import com.calorie.dto.UserProfileDTO;
import com.calorie.dto.UserSettingsDTO;
import com.calorie.entity.User;
import com.calorie.entity.UserStatistics;
import com.calorie.exception.BusinessException;
import com.calorie.mapper.UserMapper;
import com.calorie.mapper.UserStatisticsMapper;
import com.calorie.service.UserService;
import com.calorie.util.JwtUtil;
import com.calorie.vo.UserInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.chanjar.weixin.common.error.WxErrorException;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserStatisticsMapper userStatisticsMapper;
    private final WxMaService wxMaService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtUtil jwtUtil;

    /**
     * 用户登录
     *
     * @param loginDTO 登录DTO
     * @return 用户信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserInfoVO login(LoginDTO loginDTO) {
        try {
            // 通过code获取openid和session_key
            WxMaJscode2SessionResult sessionResult = wxMaService.getUserService().getSessionInfo(loginDTO.getCode());
            String openid = sessionResult.getOpenid();
            
            // 查询用户是否存在
            User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getOpenid, openid));
            
            // 不存在则注册新用户
            if (user == null) {
                user = new User();
                user.setOpenid(openid);
                user.setNickname(loginDTO.getNickName());
                user.setAvatarUrl(loginDTO.getAvatarUrl());
                user.setGender(loginDTO.getGender());
                user.setTargetCalories(2000); // 默认目标卡路里
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                userMapper.insert(user);
            } else {
                // 更新用户信息
                if (loginDTO.getNickName() != null && !loginDTO.getNickName().isEmpty()) {
                    user.setNickname(loginDTO.getNickName());
                    user.setAvatarUrl(loginDTO.getAvatarUrl());
                    user.setGender(loginDTO.getGender());
                    user.setUpdatedAt(LocalDateTime.now());
                    userMapper.updateById(user);
                }
            }
            
            // 生成token
            String token = jwtUtil.generateToken(user.getId());
            
            // 将用户信息存入Redis
            String userKey = Constants.RedisPrefix.USER_INFO + user.getId();
            redisTemplate.opsForValue().set(userKey, user, Constants.TimeValue.SECONDS_ONE_WEEK, TimeUnit.SECONDS);
            
            // 返回用户信息
            UserInfoVO userInfoVO = new UserInfoVO();
            BeanUtils.copyProperties(user, userInfoVO);
            userInfoVO.setToken(token);
            
            return userInfoVO;
            
        } catch (WxErrorException e) {
            log.error("微信登录异常", e);
            throw new BusinessException("微信登录失败: " + e.getMessage(), Constants.BusinessCode.USER_ERROR);
        }
    }

    /**
     * 获取用户个人资料
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    @Override
    public UserInfoVO getUserProfile(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在", Constants.BusinessCode.USER_ERROR);
        }
        
        UserInfoVO userInfoVO = new UserInfoVO();
        BeanUtils.copyProperties(user, userInfoVO);
        
        return userInfoVO;
    }

    /**
     * 更新用户个人资料
     *
     * @param userId 用户ID
     * @param userProfileDTO 用户资料DTO
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserProfile(Integer userId, UserProfileDTO userProfileDTO) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在", Constants.BusinessCode.USER_ERROR);
        }
        
        // 更新用户信息
        if (userProfileDTO.getNickname() != null) {
            user.setNickname(userProfileDTO.getNickname());
        }
        if (userProfileDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(userProfileDTO.getAvatarUrl());
        }
        if (userProfileDTO.getGender() != null) {
            user.setGender(userProfileDTO.getGender());
        }
        if (userProfileDTO.getAge() != null) {
            user.setAge(userProfileDTO.getAge());
        }
        if (userProfileDTO.getHeight() != null) {
            user.setHeight(userProfileDTO.getHeight());
        }
        if (userProfileDTO.getWeight() != null) {
            user.setWeight(userProfileDTO.getWeight());
        }
        if (userProfileDTO.getTargetCalories() != null) {
            user.setTargetCalories(userProfileDTO.getTargetCalories());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
        
        // 更新Redis中的用户信息
        String userKey = Constants.RedisPrefix.USER_INFO + user.getId();
        redisTemplate.opsForValue().set(userKey, user, Constants.TimeValue.SECONDS_ONE_WEEK, TimeUnit.SECONDS);
    }

    /**
     * 获取用户统计数据
     *
     * @param userId 用户ID
     * @param startDateStr 开始日期
     * @param endDateStr   结束日期
     * @return 统计数据
     */
    @Override
    public Map<String, Object> getUserStatistics(Integer userId, String startDateStr, String endDateStr) {
        // 日期处理
        LocalDate startDate = null;
        LocalDate endDate = null;
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        try {
            if (startDateStr != null && !startDateStr.isEmpty()) {
                startDate = LocalDate.parse(startDateStr, formatter);
            } else {
                // 默认为过去7天
                startDate = LocalDate.now().minusDays(6);
            }
            
            if (endDateStr != null && !endDateStr.isEmpty()) {
                endDate = LocalDate.parse(endDateStr, formatter);
            } else {
                // 默认为今天
                endDate = LocalDate.now();
            }
        } catch (DateTimeParseException e) {
            throw new BusinessException("日期格式不正确，请使用yyyy-MM-dd格式", Constants.BusinessCode.PARAM_ERROR);
        }
        
        // 查询统计数据
        List<UserStatistics> statisticsList = userStatisticsMapper.selectList(
                new LambdaQueryWrapper<UserStatistics>()
                        .eq(UserStatistics::getUserId, userId)
                        .ge(startDate != null, UserStatistics::getDate, startDate)
                        .le(endDate != null, UserStatistics::getDate, endDate)
                        .orderByAsc(UserStatistics::getDate)
        );
        
        // 构建结果数据
        Map<String, Object> result = new HashMap<>();
        result.put("statistics", statisticsList);
        
        // 计算总卡路里、营养素等汇总数据
        int totalCalories = statisticsList.stream()
                .mapToInt(UserStatistics::getTotalCalories)
                .sum();
        
        result.put("totalCalories", totalCalories);
        result.put("averageCalories", statisticsList.isEmpty() ? 0 : totalCalories / statisticsList.size());
        
        return result;
    }

    /**
     * 保存用户设置
     *
     * @param userId 用户ID
     * @param userSettingsDTO 用户设置DTO
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveUserSettings(Integer userId, UserSettingsDTO userSettingsDTO) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在", Constants.BusinessCode.USER_ERROR);
        }

        // 更新用户的目标卡路里
        if (userSettingsDTO.getTargetCalories() != null) {
            user.setTargetCalories(userSettingsDTO.getTargetCalories());
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.updateById(user);

            // 更新Redis中的用户信息
            String userKey = Constants.RedisPrefix.USER_INFO + user.getId();
            redisTemplate.opsForValue().set(userKey, user, Constants.TimeValue.SECONDS_ONE_WEEK, TimeUnit.SECONDS);
        }

        // 保存其他设置到Redis（提醒设置等）
        if (userSettingsDTO.getReminderEnabled() != null || 
            userSettingsDTO.getBreakfastReminderTime() != null ||
            userSettingsDTO.getLunchReminderTime() != null ||
            userSettingsDTO.getDinnerReminderTime() != null) {
            
            String settingsKey = Constants.RedisPrefix.USER_SETTINGS + userId;
            redisTemplate.opsForValue().set(settingsKey, userSettingsDTO, Constants.TimeValue.SECONDS_ONE_WEEK, TimeUnit.SECONDS);
        }

        log.info("用户{}设置保存成功", userId);
    }

    /**
     * 获取用户设置
     *
     * @param userId 用户ID
     * @return 用户设置
     */
    @Override
    public UserSettingsDTO getUserSettings(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在", Constants.BusinessCode.USER_ERROR);
        }

        UserSettingsDTO userSettingsDTO = new UserSettingsDTO();
        
        // 从用户表获取目标卡路里
        userSettingsDTO.setTargetCalories(user.getTargetCalories());

        // 从Redis获取其他设置
        String settingsKey = Constants.RedisPrefix.USER_SETTINGS + userId;
        UserSettingsDTO cachedSettings = (UserSettingsDTO) redisTemplate.opsForValue().get(settingsKey);
        
        if (cachedSettings != null) {
            userSettingsDTO.setReminderEnabled(cachedSettings.getReminderEnabled());
            userSettingsDTO.setBreakfastReminderTime(cachedSettings.getBreakfastReminderTime());
            userSettingsDTO.setLunchReminderTime(cachedSettings.getLunchReminderTime());
            userSettingsDTO.setDinnerReminderTime(cachedSettings.getDinnerReminderTime());
        } else {
            // 设置默认值
            userSettingsDTO.setReminderEnabled(false);
            userSettingsDTO.setBreakfastReminderTime("08:00");
            userSettingsDTO.setLunchReminderTime("12:00");
            userSettingsDTO.setDinnerReminderTime("18:00");
        }

        return userSettingsDTO;
    }
} 