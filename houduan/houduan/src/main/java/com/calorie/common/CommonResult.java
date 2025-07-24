package com.calorie.common;

import lombok.Data;

/**
 * 通用返回结果
 * @param <T> 数据类型
 */
@Data
public class CommonResult<T> {
    
    /**
     * 状态码
     */
    private Integer code;
    
    /**
     * 返回消息
     */
    private String message;
    
    /**
     * 返回数据
     */
    private T data;
    
    /**
     * 是否成功
     */
    private Boolean success;
    
    protected CommonResult() {
    }
    
    protected CommonResult(Integer code, String message, T data, Boolean success) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.success = success;
    }
    
    /**
     * 成功返回结果
     */
    public static <T> CommonResult<T> success() {
        return new CommonResult<>(200, "操作成功", null, true);
    }
    
    /**
     * 成功返回结果
     * @param data 获取的数据
     */
    public static <T> CommonResult<T> success(T data) {
        return new CommonResult<>(200, "操作成功", data, true);
    }
    
    /**
     * 成功返回结果
     * @param data 获取的数据
     * @param message 提示信息
     */
    public static <T> CommonResult<T> success(T data, String message) {
        return new CommonResult<>(200, message, data, true);
    }
    
    /**
     * 失败返回结果
     * @param message 提示信息
     */
    public static <T> CommonResult<T> failed(String message) {
        return new CommonResult<>(500, message, null, false);
    }
    
    /**
     * 失败返回结果
     * @param code 错误码
     * @param message 提示信息
     */
    public static <T> CommonResult<T> failed(Integer code, String message) {
        return new CommonResult<>(code, message, null, false);
    }
    
    /**
     * 参数验证失败返回结果
     */
    public static <T> CommonResult<T> validateFailed() {
        return new CommonResult<>(400, "参数验证失败", null, false);
    }
    
    /**
     * 参数验证失败返回结果
     * @param message 提示信息
     */
    public static <T> CommonResult<T> validateFailed(String message) {
        return new CommonResult<>(400, message, null, false);
    }
    
    /**
     * 未授权返回结果
     */
    public static <T> CommonResult<T> unauthorized(String message) {
        return new CommonResult<>(401, message, null, false);
    }
    
    /**
     * 未授权返回结果
     */
    public static <T> CommonResult<T> forbidden(String message) {
        return new CommonResult<>(403, message, null, false);
    }
} 