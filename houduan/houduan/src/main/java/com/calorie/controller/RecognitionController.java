package com.calorie.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.calorie.common.CommonResult;
import com.calorie.service.RecognitionService;
import com.calorie.vo.FoodRecognitionVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 食物识别控制器
 */
@Slf4j
@RestController
@RequestMapping("/recognition")
public class RecognitionController {

    @Autowired
    private RecognitionService recognitionService;
    
    @Value("${image.recognition.provider}")
    private String recognitionProvider;
    
    @Value("${image.recognition.baidu.app-id:}")
    private String baiduAppId;

    /**
     * 上传图片识别食物
     * 
     * @param file 图片文件
     * @return 识别结果
     */
    @PostMapping("/upload")
    public CommonResult<FoodRecognitionVO> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return CommonResult.failed("请选择图片文件");
        }
        
        // 获取文件名、类型等信息
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        log.info("上传图片进行识别：文件名={}, 类型={}, 大小={}KB, 识别提供商={}", 
                originalFilename, contentType, file.getSize() / 1024, recognitionProvider);
        
        // 图片格式校验
        if (contentType == null || !contentType.startsWith("image/")) {
            return CommonResult.failed("只支持图片文件");
        }
        
        try {
            // 调用识别服务
            FoodRecognitionVO result = recognitionService.recognizeFood(file);
            
            if (result.getSuccess()) {
                log.info("CommonResult.success(result):{}", CommonResult.success(result));
                return CommonResult.success(result);
            } else {
                return CommonResult.failed(result.getMessage());
            }
        } catch (Exception e) {
            log.error("食物识别失败", e);
            return CommonResult.failed("识别失败: " + e.getMessage());
        }
    }
    
    /**
     * 保存识别记录
     * 
     * @param request HTTP请求
     * @param imageUrl 图片链接
     * @param foodName 食物名称
     * @param userId 用户ID
     * @return 保存结果
     */
    @PostMapping("/save")
    public CommonResult<Long> saveRecord(HttpServletRequest request,
                                        @RequestParam("imageUrl") String imageUrl,
                                        @RequestParam("foodName") String foodName,
                                        @RequestParam(value = "userId", required = false) String userId) {
        try {
            long recordId = recognitionService.saveRecord(request, imageUrl, foodName, userId);
            return CommonResult.success(recordId);
        } catch (Exception e) {
            log.error("保存识别记录失败", e);
            return CommonResult.failed("保存失败: " + e.getMessage());
        }
    }

    /**
     * 获取识别提供商
     * 
     * @return 识别提供商名称
     */
    @GetMapping("/provider")
    public CommonResult<String> getProvider() {
        return CommonResult.success(recognitionProvider);
    }
    
    /**
     * 切换识别提供商（仅用于测试，实际生产环境应该通过配置文件修改）
     * 
     * @param provider 提供商名称（baidu或tflite）
     * @return 切换结果
     */
    @PostMapping("/switch-provider")
    public CommonResult<String> switchProvider(@RequestParam("provider") String provider) {
        if ("baidu".equals(provider)) {
            if (baiduAppId == null || baiduAppId.isEmpty() || "你的百度AI应用APPID".equals(baiduAppId)) {
                return CommonResult.failed("未配置百度AI相关信息，无法切换");
            }
            System.setProperty("image.recognition.provider", "baidu");
            log.info("识别提供商切换为：百度AI");
            return CommonResult.success("百度AI");
        } else if ("tflite".equals(provider)) {
            System.setProperty("image.recognition.provider", "tflite");
            log.info("识别提供商切换为：TFLite");
            return CommonResult.success("TFLite");
        } else if ("mock".equals(provider)) {
            System.setProperty("image.recognition.provider", "mock");
            log.info("识别提供商切换为：模拟数据");
            return CommonResult.success("模拟数据");
        } else {
            return CommonResult.failed("不支持的提供商类型");
        }
    }
} 