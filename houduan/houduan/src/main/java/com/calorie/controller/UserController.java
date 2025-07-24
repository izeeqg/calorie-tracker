package com.calorie.controller;

import com.calorie.common.R;
import com.calorie.dto.LoginDTO;
import com.calorie.dto.UserProfileDTO;
import com.calorie.dto.UserSettingsDTO;
import com.calorie.service.UserService;
import com.calorie.vo.UserInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

/**
 * 用户控制器
 */
@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    /**
     * 用户服务
     */
    private final UserService userService;

    /**
     * 微信小程序登录
     *
     * @param loginDTO 登录DTO
     * @return 登录信息
     */
    @PostMapping("/login")
    public R<UserInfoVO> login(@RequestBody @Valid LoginDTO loginDTO) {
        log.info("小程序用户登录：{}", loginDTO.getCode());
        return R.success(userService.login(loginDTO));
    }

    /**
     * 获取用户信息
     *
     * @param request 请求对象
     * @return 用户信息
     */
    @GetMapping("/profile")
    public R<UserInfoVO> getProfile(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return R.success(userService.getUserProfile(userId));
    }

    /**
     * 更新用户信息
     *
     * @param request 请求对象
     * @param userProfileDTO 用户信息DTO
     * @return 更新结果
     */
    @PutMapping("/profile")
    public R<Void> updateProfile(HttpServletRequest request, @RequestBody @Valid UserProfileDTO userProfileDTO) {
        Integer userId = (Integer) request.getAttribute("userId");
        userService.updateUserProfile(userId, userProfileDTO);
        return R.success();
    }

    /**
     * 获取用户统计数据
     *
     * @param request 请求对象
     * @param startDate 开始日期（yyyy-MM-dd）
     * @param endDate   结束日期（yyyy-MM-dd）
     * @return 统计数据
     */
    @GetMapping("/statistics")
    public R<Object> getStatistics(
            HttpServletRequest request,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Integer userId = (Integer) request.getAttribute("userId");
        return R.success(userService.getUserStatistics(userId, startDate, endDate));
    }

    /**
     * 保存用户设置
     *
     * @param request 请求对象
     * @param userSettingsDTO 用户设置DTO
     * @return 保存结果
     */
    @PostMapping("/settings")
    public R<Void> saveUserSettings(HttpServletRequest request, @RequestBody @Valid UserSettingsDTO userSettingsDTO) {
        // 从请求中获取用户ID（由认证拦截器设置）
        Integer userId = (Integer) request.getAttribute("userId");
        log.info("保存用户{}的设置：{}", userId, userSettingsDTO);
        userService.saveUserSettings(userId, userSettingsDTO);
        return R.success();
    }

    /**
     * 获取用户设置
     *
     * @param request 请求对象
     * @return 用户设置
     */
    @GetMapping("/settings")
    public R<UserSettingsDTO> getUserSettings(HttpServletRequest request) {
        // 从请求中获取用户ID（由认证拦截器设置）
        Integer userId = (Integer) request.getAttribute("userId");
        log.info("获取用户{}的设置", userId);
        return R.success(userService.getUserSettings(userId));
    }
} 