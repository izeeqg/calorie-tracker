package com.calorie.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;

/**
 * 登录数据传输对象
 */
@Data
public class LoginDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 微信临时登录凭证
     */
    @NotBlank(message = "登录凭证不能为空")
    private String code;

    /**
     * 用户信息加密数据
     */
    private String encryptedData;

    /**
     * 加密算法的初始向量
     */
    private String iv;

    /**
     * 用户昵称
     */
    private String nickName;

    /**
     * 用户头像
     */
    private String avatarUrl;

    /**
     * 性别 0-未知 1-男 2-女
     */
    private Integer gender;
} 