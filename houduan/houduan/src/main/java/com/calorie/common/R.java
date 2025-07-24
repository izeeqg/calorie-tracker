package com.calorie.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果类
 * 
 * @param <T> 数据类型
 */
@Data
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     */
    private Integer code;

    /**
     * 消息
     */
    private String message;

    /**
     * 数据
     */
    private T data;

    /**
     * 成功
     */
    public static <T> R<T> success() {
        return success(null);
    }

    /**
     * 成功
     *
     * @param data 数据
     */
    public static <T> R<T> success(T data) {
        return success(data, "操作成功");
    }

    /**
     * 成功
     *
     * @param data    数据
     * @param message 消息
     */
    public static <T> R<T> success(T data, String message) {
        R<T> r = new R<>();
        r.setCode(Constants.BusinessCode.SUCCESS);
        r.setData(data);
        r.setMessage(message);
        return r;
    }

    /**
     * 失败
     */
    public static <T> R<T> fail() {
        return fail("操作失败");
    }

    /**
     * 失败
     *
     * @param message 消息
     */
    public static <T> R<T> fail(String message) {
        return fail(message, Constants.BusinessCode.FAILURE);
    }

    /**
     * 失败
     *
     * @param message 消息
     * @param code    状态码
     */
    public static <T> R<T> fail(String message, Integer code) {
        R<T> r = new R<>();
        r.setCode(code);
        r.setMessage(message);
        return r;
    }
} 