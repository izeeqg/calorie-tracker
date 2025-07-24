package com.calorie.service.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.baidu.aip.imageclassify.AipImageClassify;
import com.calorie.dto.FoodDTO;
import com.calorie.service.RecognitionService;
import com.calorie.util.BaiduAiUtil;
import com.calorie.util.FileUploadUtil;
import com.calorie.vo.FoodRecognitionVO;
import com.calorie.vo.RecognitionResultVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 识别服务实现类
 */
@Slf4j
@Service
public class RecognitionServiceImpl implements RecognitionService {

    @Value("${image.recognition.provider}")
    private String recognitionProvider;
    
    @Value("${image.recognition.baidu.app-id:}")
    private String baiduAppId;
    
    @Value("${image.recognition.baidu.api-key:}")
    private String baiduApiKey;
    
    @Value("${image.recognition.baidu.secret-key:}")
    private String baiduSecretKey;
    
    @Value("${file.upload.path:./uploads}")
    private String uploadPath;
    
    @Autowired
    private BaiduAiUtil baiduAiUtil;
    
    @Autowired
    private FileUploadUtil fileUploadUtil;
    
    private AipImageClassify baiduClient;
    
    /**
     * 初始化百度AI客户端
     */
    @PostConstruct
    public void init() {
        if (baiduAppId != null && !baiduAppId.isEmpty() &&
            baiduApiKey != null && !baiduApiKey.isEmpty() &&
            baiduSecretKey != null && !baiduSecretKey.isEmpty()) {
            try {
                baiduClient = baiduAiUtil.createClient(baiduAppId, baiduApiKey, baiduSecretKey);
                log.info("百度AI图像识别客户端初始化成功");
                // 强制设置识别提供商为百度
                recognitionProvider = "baidu";
            } catch (Exception e) {
                log.error("百度AI图像识别客户端初始化失败", e);
            }
        } else {
            log.warn("百度AI配置信息不完整，请检查application.yml中的配置");
        }
    }

    @Override
    public FoodRecognitionVO recognizeFood(MultipartFile file) {
        // 优先使用百度AI识别，如果没有配置或识别失败才使用其他方式
        if (baiduClient != null) {
            log.info("使用百度AI识别菜品");
            try {
                // 优先检查是否可以直接使用MultipartFile
                try {
                    // 使用配置好的api key和secret key创建一个HTTP请求访问令牌
                    String authHost = "https://aip.baidubce.com/oauth/2.0/token";
                    String getAccessTokenUrl = authHost
                        + "?grant_type=client_credentials"
                        + "&client_id=" + baiduApiKey
                        + "&client_secret=" + baiduSecretKey;
                    
                    // 使用hutool发送请求获取令牌
                    String tokenResponse = cn.hutool.http.HttpUtil.get(getAccessTokenUrl);
                    org.json.JSONObject tokenJson = new org.json.JSONObject(tokenResponse);
                    String accessToken = tokenJson.getString("access_token");
                    
                    // 使用访问令牌调用HTTP方法
                    FoodRecognitionVO result = baiduAiUtil.recognizeFood(file, baiduClient);
                    if (result.getSuccess() && (result.getFoods() == null || result.getFoods().isEmpty())) {
                        log.warn("百度AI识别成功但未返回菜品数据，将使用备用方法");
                        // 如果百度AI没有识别出菜品，尝试备用方法
                        result = tryAlternativeMethod(file);
                    }
                    return result;
                } catch (Exception e) {
                    log.error("直接调用百度API失败，将尝试使用文件路径调用识别: {}", e.getMessage());
                    
                    // 如果直接调用MultipartFile失败，可以尝试使用文件路径调用识别
                    try {
                        // 获取当前目录
                        String rootPath = new File(".").getAbsolutePath();
                        if (rootPath.endsWith(".")) {
                            rootPath = rootPath.substring(0, rootPath.length() - 1);
                        }
                        
                        // 生成当前日期目录
                        String datePath = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy/MM/dd"));
                        String folder = "food";
                        String fileName = file.getOriginalFilename();
                        if (fileName == null) {
                            fileName = "temp_" + System.currentTimeMillis() + ".jpg";
                        }
                        
                        // 生成完整的目标目录路径
                        String targetDir = rootPath + File.separator + "uploads" + File.separator + folder + File.separator + datePath;
                        Path dirPath = Paths.get(targetDir);
                        
                        log.info("临时文件存储目录: {}", dirPath.toAbsolutePath());
                        
                        // 创建目录
                        Files.createDirectories(dirPath);
                        
                        // 生成临时文件路径
                        Path tempFilePath = dirPath.resolve(fileName);
                        File tempFile = tempFilePath.toFile();
                        
                        log.info("将文件复制到临时目录: {}", tempFile.getAbsolutePath());
                        
                        // 复制文件到临时目录
                        file.transferTo(tempFile);
                        
                        // 验证文件存在性
                        if (!tempFile.exists()) {
                            throw new java.io.IOException("临时文件创建失败");
                        }
                        
                        // 使用文件路径调用识别
                        FoodRecognitionVO result = baiduAiUtil.recognizeFoodFromPath(tempFile.getAbsolutePath(), baiduClient);
                        
                        if (result.getSuccess() && (result.getFoods() == null || result.getFoods().isEmpty())) {
                            log.warn("文件路径识别成功但未返回菜品数据，将使用HTTP备用方法");
                            // 如果文件路径识别成功但未返回菜品数据，尝试HTTP备用方法
                            try {
                                // 获取访问令牌
                                String authHost = "https://aip.baidubce.com/oauth/2.0/token";
                                String getAccessTokenUrl = authHost
                                    + "?grant_type=client_credentials"
                                    + "&client_id=" + baiduApiKey
                                    + "&client_secret=" + baiduSecretKey;
                                
                                // 使用hutool发送请求获取令牌
                                String tokenResponse = cn.hutool.http.HttpUtil.get(getAccessTokenUrl);
                                org.json.JSONObject tokenJson = new org.json.JSONObject(tokenResponse);
                                String accessToken = tokenJson.getString("access_token");
                                
                                // 使用访问令牌调用HTTP方法
                                result = baiduAiUtil.recognizeFoodByHttpFromPath(tempFile.getAbsolutePath(), accessToken);
                            } catch (Exception ex) {
                                log.error("HTTP备用方法调用百度API失败", ex);
                            }
                        }
                        
                        return result;
                    } catch (Exception ex) {
                        log.error("文件路径识别失败: {}", ex.getMessage());
                        return createErrorResult("文件路径识别失败: " + ex.getMessage());
                    }
                }
            } catch (Exception e) {
                log.error("百度AI识别菜品失败", e);
                return createErrorResult("百度AI识别失败: " + e.getMessage());
            }
        } else {
            log.error("百度AI客户端未初始化，请检查配置");
            return createErrorResult("百度AI客户端未初始化，请检查配置");
        }
    }
    
    /**
     * 尝试备用方法
     * 
     * @param file 图片文件
     * @return 识别结果
     */
    private FoodRecognitionVO tryAlternativeMethod(MultipartFile file) {
        try {
            // 使用备用方法的api key和secret key创建一个HTTP请求访问令牌
            String authHost = "https://aip.baidubce.com/oauth/2.0/token";
            String getAccessTokenUrl = authHost
                + "?grant_type=client_credentials"
                + "&client_id=" + baiduApiKey
                + "&client_secret=" + baiduSecretKey;
            
            // 使用hutool发送请求获取令牌
            String tokenResponse = cn.hutool.http.HttpUtil.get(getAccessTokenUrl);
            org.json.JSONObject tokenJson = new org.json.JSONObject(tokenResponse);
            String accessToken = tokenJson.getString("access_token");
            
            // 使用访问令牌调用HTTP方法
            return baiduAiUtil.recognizeFoodByHttp(file, accessToken);
        } catch (Exception e) {
            log.error("HTTP备用方法调用百度API失败", e);
            return createErrorResult("HTTP备用方法调用百度API失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建错误结果
     * 
     * @param message 错误信息
     * @return 错误的识别结果
     */
    private FoodRecognitionVO createErrorResult(String message) {
        FoodRecognitionVO result = new FoodRecognitionVO();
        result.setFoods(new ArrayList<>());
        result.setSuccess(false);
        result.setMessage(message);
        return result;
    }

    @Override
    public long saveRecord(HttpServletRequest request, String imageUrl, String foodName, String userId) {
        log.info("保存识别记录: imageUrl={}, foodName={}, userId={}", imageUrl, foodName, userId);
        return System.currentTimeMillis();
    }

    @Override
    public RecognitionResultVO recognizeImage(MultipartFile file) {
        RecognitionResultVO result = new RecognitionResultVO();
        result.setId(System.currentTimeMillis());
        result.setImageUrl("/images/sample.jpg");
        result.setFoodName("模拟食物");
        return result;
    }

    @Override
    public RecognitionResultVO getRecognitionResult(Long id) {
        RecognitionResultVO result = new RecognitionResultVO();
        result.setId(id);
        result.setImageUrl("/images/sample.jpg");
        result.setFoodName("模拟食物");
        return result;
    }

    @Override
    public List<RecognitionResultVO> getHistoryRecords(Integer page, Integer size) {
        List<RecognitionResultVO> results = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            RecognitionResultVO result = new RecognitionResultVO();
            result.setId(System.currentTimeMillis() + i);
            result.setImageUrl("/images/sample.jpg");
            result.setFoodName("模拟食物" + i);
            results.add(result);
        }
        return results;
    }

    @Override
    public FoodRecognitionVO recognizeFoodFromPath(String filePath) {
        // 优先使用百度AI识别
        if (baiduClient != null) {
            log.info("使用百度AI识别菜品，文件路径: {}", filePath);
            try {
                // 使用文件路径直接调用识别服务
                FoodRecognitionVO result = baiduAiUtil.recognizeFoodFromPath(filePath, baiduClient);
                
                if (result.getSuccess() && (result.getFoods() == null || result.getFoods().isEmpty())) {
                    log.warn("百度AI识别成功但未返回菜品数据，将使用HTTP备用方法");
                    // 如果百度AI没有识别出菜品，尝试HTTP方式调用
                    try {
                        // 获取访问令牌
                        String authHost = "https://aip.baidubce.com/oauth/2.0/token";
                        String getAccessTokenUrl = authHost
                            + "?grant_type=client_credentials"
                            + "&client_id=" + baiduApiKey
                            + "&client_secret=" + baiduSecretKey;
                        
                        // 使用hutool发送请求获取令牌
                        String tokenResponse = cn.hutool.http.HttpUtil.get(getAccessTokenUrl);
                        org.json.JSONObject tokenJson = new org.json.JSONObject(tokenResponse);
                        String accessToken = tokenJson.getString("access_token");
                        
                        // 使用访问令牌调用HTTP方法
                        result = baiduAiUtil.recognizeFoodByHttpFromPath(filePath, accessToken);
                    } catch (Exception e) {
                        log.error("HTTP方式调用百度API失败", e);
                    }
                }
                return result;
            } catch (Exception e) {
                log.error("百度AI识别菜品失败", e);
                return createErrorResult("百度AI识别失败: " + e.getMessage());
            }
        } else {
            log.error("百度AI客户端未初始化，请检查配置");
            return createErrorResult("百度AI客户端未初始化，请检查配置");
        }
    }
} 