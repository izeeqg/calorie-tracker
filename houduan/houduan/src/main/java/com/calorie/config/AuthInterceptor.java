package com.calorie.config;

import com.calorie.common.Constants;
import com.calorie.entity.User;
import com.calorie.exception.BusinessException;
import com.calorie.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 认证拦截器
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 如果是OPTIONS请求，放行
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // 获取token
        String token = request.getHeader(Constants.JwtHeader);
        if (!StringUtils.hasText(token)) {
            throw new BusinessException("未登录", Constants.BusinessCode.USER_ERROR);
        }

        // 验证token
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException("登录已过期，请重新登录", Constants.BusinessCode.USER_ERROR);
        }

        // 获取用户ID
        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            throw new BusinessException("无效的Token", Constants.BusinessCode.USER_ERROR);
        }

        // 从Redis获取用户信息
        String userKey = Constants.RedisPrefix.USER_INFO + userId;
        User user = (User) redisTemplate.opsForValue().get(userKey);
        if (user == null) {
            throw new BusinessException("登录已过期，请重新登录", Constants.BusinessCode.USER_ERROR);
        }

        // 将用户信息设置到请求属性中
        request.setAttribute("currentUser", user);
        request.setAttribute("userId", userId);

        return true;
    }
} 