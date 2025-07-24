package com.calorie.exception;

import com.calorie.common.Constants;
import lombok.Getter;

/**
 * 业务异常类
 */
@Getter
public class BusinessException extends RuntimeException {

    /**
     * 状态码
     */
    private final Integer code;

    /**
     * 构造函数
     *
     * @param message 错误消息
     */
    public BusinessException(String message) {
        super(message);
        this.code = Constants.BusinessCode.FAILURE;
    }

    /**
     * 构造函数
     *
     * @param message 错误消息
     * @param code    状态码
     */
    public BusinessException(String message, Integer code) {
        super(message);
        this.code = code;
    }

    /**
     * 构造函数
     *
     * @param message 错误消息
     * @param cause   原始异常
     * @param code    状态码
     */
    public BusinessException(String message, Throwable cause, Integer code) {
        super(message, cause);
        this.code = code;
    }
} 