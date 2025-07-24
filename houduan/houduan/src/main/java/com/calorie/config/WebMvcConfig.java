package com.calorie.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Web MVC配置类
 * 处理静态资源映射和拦截器配置
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.path}")
    private String uploadPath;

    @Value("${file.access.path}")
    private String accessPath;
    
    private final AuthInterceptor authInterceptor;

    /**
     * 跨域配置
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * 拦截器配置
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")  // 拦截所有请求
                .excludePathPatterns(
                        "/user/login",           // 微信登录接口
                        "/api/auth/login",       // API登录接口
                        "/api/user/login",       // API用户登录
                        "/files/**",             // 静态资源文件
                        "/error",                // 错误页面
                        "/actuator/**",          // 监控端点
                        "/swagger-ui/**",        // Swagger文档
                        "/v3/api-docs/**",       // API文档
                        "/favicon.ico"           // 网站图标
                );
    }

    /**
     * 资源处理器配置
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 获取绝对路径，确保末尾有分隔符
        File uploadDir = new File(uploadPath);
        String realPath = uploadDir.getAbsolutePath();
        if (!realPath.endsWith(File.separator)) {
            realPath = realPath + File.separator;
        }
        
        String fileProtocolPath = "file:" + realPath;
        
        // 添加静态资源映射
        registry.addResourceHandler(accessPath + "/**")
                .addResourceLocations(fileProtocolPath);
        
        // 打印映射信息
        System.out.println("资源映射配置: " + accessPath + "/** -> " + fileProtocolPath);
        System.out.println("资源目录是否存在: " + uploadDir.exists());
        System.out.println("资源目录绝对路径: " + realPath);
        
        // 确保目录存在
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            System.out.println("创建资源目录: " + (created ? "成功" : "失败"));
        }
    }
} 