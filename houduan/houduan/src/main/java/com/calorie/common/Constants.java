package com.calorie.common;

/**
 * 系统常量类
 */
public class Constants {

    /**
     * JWT请求头
     */
    public static final String JwtHeader = "Authorization";

    /**
     * Redis键前缀
     */
    public static class RedisPrefix {
        /**
         * 用户Token键前缀
         */
        public static final String USER_TOKEN = "user:token:";
        
        /**
         * 用户信息键前缀
         */
        public static final String USER_INFO = "user:info:";
        
        /**
         * 用户设置键前缀
         */
        public static final String USER_SETTINGS = "user:settings:";
        
        /**
         * 图片识别结果键前缀
         */
        public static final String IMAGE_RECOGNITION = "image:recognition:";
    }
    
    /**
     * HTTP状态码
     */
    public static class HttpStatus {
        /**
         * 成功
         */
        public static final int SUCCESS = 200;
        
        /**
         * 创建成功
         */
        public static final int CREATED = 201;
        
        /**
         * 请求错误
         */
        public static final int BAD_REQUEST = 400;
        
        /**
         * 未认证
         */
        public static final int UNAUTHORIZED = 401;
        
        /**
         * 禁止访问
         */
        public static final int FORBIDDEN = 403;
        
        /**
         * 资源不存在
         */
        public static final int NOT_FOUND = 404;
        
        /**
         * 服务器内部错误
         */
        public static final int ERROR = 500;
    }
    
    /**
     * 业务状态码
     */
    public static class BusinessCode {
        /**
         * 操作成功
         */
        public static final int SUCCESS = 0;
        
        /**
         * 操作失败
         */
        public static final int FAILURE = 1;
        
        /**
         * 参数错误
         */
        public static final int PARAM_ERROR = 1001;
        
        /**
         * 用户错误
         */
        public static final int USER_ERROR = 2001;
        
        /**
         * 文件上传错误
         */
        public static final int FILE_ERROR = 3001;
        
        /**
         * 识别错误
         */
        public static final int RECOGNITION_ERROR = 4001;
    }
    
    /**
     * 时间常量
     */
    public static class TimeValue {
        /**
         * 一小时的秒数
         */
        public static final int SECONDS_ONE_HOUR = 3600;
        
        /**
         * 一天的秒数
         */
        public static final int SECONDS_ONE_DAY = 24 * SECONDS_ONE_HOUR;
        
        /**
         * 一周的秒数
         */
        public static final int SECONDS_ONE_WEEK = 7 * SECONDS_ONE_DAY;
    }
    
    /**
     * 餐食类型
     */
    public static class MealType {
        /**
         * 早餐
         */
        public static final int BREAKFAST = 1;
        
        /**
         * 午餐
         */
        public static final int LUNCH = 2;
        
        /**
         * 晚餐
         */
        public static final int DINNER = 3;
        
        /**
         * 宵夜
         */
        public static final int MIDNIGHT_SNACK = 4;
        
        /**
         * 零食
         */
        public static final int SNACK = 5;
    }
    
    /**
     * 图像识别状态
     */
    public static class RecognitionStatus {
        /**
         * 处理中
         */
        public static final int PROCESSING = 0;
        
        /**
         * 成功
         */
        public static final int SUCCESS = 1;
        
        /**
         * 失败
         */
        public static final int FAILURE = 2;
    }
} 