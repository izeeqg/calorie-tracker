package com.calorie.util;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.baidu.aip.imageclassify.AipImageClassify;
import com.calorie.dto.FoodDTO;
import com.calorie.vo.FoodRecognitionVO;

import cn.hutool.core.codec.Base64;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import lombok.extern.slf4j.Slf4j;

/**
 * 百度AI图像识别工具类 - 直接使用百度百科卡路里数据
 */
@Slf4j
@Component
public class BaiduAiUtil {
    
    /**
     * 创建百度AI图像识别客户端
     * 
     * @param appId 应用ID
     * @param apiKey 应用API Key
     * @param secretKey 应用Secret Key
     * @return AipImageClassify客户端实例
     */
    public AipImageClassify createClient(String appId, String apiKey, String secretKey) {
        // 初始化AipImageClassify客户端
        AipImageClassify client = new AipImageClassify(appId, apiKey, secretKey);
        
        // 可选：设置网络连接参数
        client.setConnectionTimeoutInMillis(2000);
        client.setSocketTimeoutInMillis(60000);
        
        return client;
    }
    
    /**
     * 识别图片中的菜品
     * 
     * @param file 图片文件
     * @param client 百度AI图像识别客户端
     * @return 识别结果
     */
    public FoodRecognitionVO recognizeFood(MultipartFile file, AipImageClassify client) {
        FoodRecognitionVO result = new FoodRecognitionVO();
        
        try {
            // 转换图片为字节数组
            byte[] imageData = file.getBytes();
            
            // 配置菜品识别参数
            HashMap<String, String> options = new HashMap<>();
            options.put("top_num", "5"); // 返回预测得分前5的结果
            options.put("baike_num", "2"); // 返回百科信息结果数
            
            // 调用菜品识别API
            org.json.JSONObject response = client.dishDetect(imageData, options);
            log.info("百度AI菜品识别结果: {}", response.toString());
            
            // 判断是否有错误码
            if (!response.has("error_code")) {
                // 创建食物列表
                List<FoodDTO> foods = new ArrayList<>();
                
                // 解析识别结果
                JSONArray resultArray = response.getJSONArray("result");
                for (int i = 0; i < resultArray.length(); i++) {
                    JSONObject food = resultArray.getJSONObject(i);
                    
                    String foodName = food.getString("name");
                    float probability = food.getFloat("probability") * 100; // 转换为百分比
                    
                    FoodDTO foodDTO = new FoodDTO();
                    foodDTO.setName(foodName);
                    foodDTO.setProbability(probability);
                    
                    // 直接使用百度API返回的卡路里数据
                    parseBaiduCalories(food, foodDTO, foodName);
                    
                    // 获取百科信息（如果有）
                    if (food.has("baike_info")) {
                        JSONObject baikeInfo = food.getJSONObject("baike_info");
                        if (baikeInfo.has("description")) {
                            foodDTO.setDescription(baikeInfo.getString("description"));
                        }
                        if (baikeInfo.has("image_url")) {
                            foodDTO.setImageUrl(baikeInfo.getString("image_url"));
                        }
                    }
                    
                    foods.add(foodDTO);
                }
                
                result.setFoods(foods);
                result.setSuccess(true);
                result.setMessage("识别成功");
            } else {
                result.setSuccess(false);
                result.setMessage("识别失败: " + response.getString("error_msg"));
            }
        } catch (Exception e) {
            log.error("菜品识别异常", e);
            result.setSuccess(false);
            result.setMessage("识别异常: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 从文件路径识别图片中的菜品
     * 
     * @param filePath 图片文件的绝对路径
     * @param client 百度AI图像识别客户端
     * @return 识别结果
     */
    public FoodRecognitionVO recognizeFoodFromPath(String filePath, AipImageClassify client) {
        FoodRecognitionVO result = new FoodRecognitionVO();
        
        try {
            log.info("从文件路径加载图片进行识别: {}", filePath);
            
            // 读取图片文件
            byte[] imageData = Files.readAllBytes(Paths.get(filePath));
            
            // 配置菜品识别参数
            HashMap<String, String> options = new HashMap<>();
            options.put("top_num", "5"); // 返回预测得分前5的结果
            options.put("baike_num", "2"); // 返回百科信息结果数
            
            // 调用菜品识别API
            org.json.JSONObject response = client.dishDetect(imageData, options);
            log.info("百度AI菜品识别结果: {}", response.toString());
            
            // 判断是否有错误码
            if (!response.has("error_code")) {
                // 创建食物列表
                List<FoodDTO> foods = new ArrayList<>();
                
                // 解析识别结果
                JSONArray resultArray = response.getJSONArray("result");
                for (int i = 0; i < resultArray.length(); i++) {
                    JSONObject food = resultArray.getJSONObject(i);
                    
                    String foodName = food.getString("name");
                    float probability = food.getFloat("probability") * 100; // 转换为百分比
                    
                    FoodDTO foodDTO = new FoodDTO();
                    foodDTO.setName(foodName);
                    foodDTO.setProbability(probability);
                    
                    // 直接使用百度API返回的卡路里数据
                    parseBaiduCalories(food, foodDTO, foodName);
                    
                    // 获取百科信息（如果有）
                    if (food.has("baike_info")) {
                        JSONObject baikeInfo = food.getJSONObject("baike_info");
                        if (baikeInfo.has("description")) {
                            foodDTO.setDescription(baikeInfo.getString("description"));
                        }
                        if (baikeInfo.has("image_url")) {
                            foodDTO.setImageUrl(baikeInfo.getString("image_url"));
                        }
                    }
                    
                    foods.add(foodDTO);
                }
                
                result.setFoods(foods);
                result.setSuccess(true);
                result.setMessage("识别成功");
            } else {
                result.setSuccess(false);
                result.setMessage("识别失败: " + response.getString("error_msg"));
            }
        } catch (Exception e) {
            log.error("菜品识别异常", e);
            result.setSuccess(false);
            result.setMessage("识别异常: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 从文件路径通过HTTP方式调用百度AI菜品识别API
     * 
     * @param filePath 图片文件的绝对路径
     * @param accessToken 访问令牌
     * @return 识别结果
     */
    public FoodRecognitionVO recognizeFoodByHttpFromPath(String filePath, String accessToken) {
        FoodRecognitionVO result = new FoodRecognitionVO();
        
        try {
            // 读取图片文件
            byte[] imageData = Files.readAllBytes(Paths.get(filePath));
            
            // API URL
            String url = "https://aip.baidubce.com/rest/2.0/image-classify/v2/dish";
            
            // 请求参数
            Map<String, Object> params = new HashMap<>();
            params.put("access_token", accessToken);
            params.put("image", Base64.encode(imageData));
            params.put("top_num", 5); // 返回预测得分前5的结果
            params.put("baike_num", 2); // 返回百科信息结果数
            
            // 发送POST请求
            String response = HttpUtil.post(url, params);
            log.info("HTTP方式调用百度AI菜品识别结果: {}", response);
            
            // 解析响应
            JSONObject jsonResponse = new JSONObject(response);
            
            if (!jsonResponse.has("error_code")) {
                // 创建食物列表
                List<FoodDTO> foods = new ArrayList<>();
                
                // 解析识别结果
                JSONArray resultArray = jsonResponse.getJSONArray("result");
                for (int i = 0; i < resultArray.length(); i++) {
                    JSONObject food = resultArray.getJSONObject(i);
                    
                    String foodName = food.getString("name");
                    float probability = food.getFloat("probability") * 100; // 转换为百分比
                    
                    FoodDTO foodDTO = new FoodDTO();
                    foodDTO.setName(foodName);
                    foodDTO.setProbability(probability);
                    
                    // 直接使用百度API返回的卡路里数据
                    parseBaiduCalories(food, foodDTO, foodName);
                    
                    // 获取百科信息（如果有）
                    if (food.has("baike_info")) {
                        JSONObject baikeInfo = food.getJSONObject("baike_info");
                        if (baikeInfo.has("description")) {
                            foodDTO.setDescription(baikeInfo.getString("description"));
                        }
                        if (baikeInfo.has("image_url")) {
                            foodDTO.setImageUrl(baikeInfo.getString("image_url"));
                        }
                    }
                    
                    foods.add(foodDTO);
                }
                
                result.setFoods(foods);
                result.setSuccess(true);
                result.setMessage("识别成功");
            } else {
                result.setSuccess(false);
                result.setMessage("识别失败: " + jsonResponse.getString("error_msg"));
            }
        } catch (Exception e) {
            log.error("通过HTTP调用菜品识别异常", e);
            result.setSuccess(false);
            result.setMessage("识别异常: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * HTTP方式调用百度AI菜品识别API（备用方法）
     * 
     * @param file 图片文件
     * @param accessToken 访问令牌
     * @return 识别结果
     */
    public FoodRecognitionVO recognizeFoodByHttp(MultipartFile file, String accessToken) {
        FoodRecognitionVO result = new FoodRecognitionVO();
        
        try {
            // API URL
            String url = "https://aip.baidubce.com/rest/2.0/image-classify/v2/dish";
            
            // 请求参数
            Map<String, Object> params = new HashMap<>();
            params.put("access_token", accessToken);
            params.put("image", Base64.encode(file.getBytes()));
            params.put("top_num", 5); // 返回预测得分前5的结果
            params.put("baike_num", 2); // 返回百科信息结果数
            
            // 发送POST请求
            String response = HttpUtil.post(url, params);
            log.info("HTTP方式调用百度AI菜品识别结果: {}", response);
            
            // 解析响应
            JSONObject jsonResponse = new JSONObject(response);
            
            if (!jsonResponse.has("error_code")) {
                // 创建食物列表
                List<FoodDTO> foods = new ArrayList<>();
                
                // 解析识别结果
                JSONArray resultArray = jsonResponse.getJSONArray("result");
                for (int i = 0; i < resultArray.length(); i++) {
                    JSONObject food = resultArray.getJSONObject(i);
                    
                    String foodName = food.getString("name");
                    float probability = food.getFloat("probability") * 100; // 转换为百分比
                    
                    FoodDTO foodDTO = new FoodDTO();
                    foodDTO.setName(foodName);
                    foodDTO.setProbability(probability);
                    
                    // 直接使用百度API返回的卡路里数据
                    parseBaiduCalories(food, foodDTO, foodName);
                    
                    // 获取百科信息（如果有）
                    if (food.has("baike_info")) {
                        JSONObject baikeInfo = food.getJSONObject("baike_info");
                        if (baikeInfo.has("description")) {
                            foodDTO.setDescription(baikeInfo.getString("description"));
                        }
                        if (baikeInfo.has("image_url")) {
                            foodDTO.setImageUrl(baikeInfo.getString("image_url"));
                        }
                    }
                    
                    foods.add(foodDTO);
                }
                
                result.setFoods(foods);
                result.setSuccess(true);
                result.setMessage("识别成功");
            } else {
                result.setSuccess(false);
                result.setMessage("识别失败: " + jsonResponse.getString("error_msg"));
            }
        } catch (Exception e) {
            log.error("通过HTTP调用菜品识别异常", e);
            result.setSuccess(false);
            result.setMessage("识别异常: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 从百度API返回的食物对象中解析卡路里值并设置到FoodDTO中
     * 
     * @param food 百度API返回的食物JSON对象
     * @param foodDTO 待设置的食物DTO对象
     * @param foodName 食物名称（用于日志）
     */
    private void parseBaiduCalories(JSONObject food, FoodDTO foodDTO, String foodName) {
        // 直接使用百度API返回的卡路里数据
        Integer calories = 0; // 默认值为0
        String originalCalorieStr = null; // 原始字符串
        
        if (food.has("calorie")) {
            try {
                // 百度API返回的卡路里可能是字符串格式
                originalCalorieStr = food.getString("calorie");
                if (originalCalorieStr != null && !originalCalorieStr.trim().isEmpty()) {
                    calories = Math.round(Float.parseFloat(originalCalorieStr));
                    log.info("使用百度百科卡路里数据: {} = {} kcal/100g (原始值: {})", foodName, calories, originalCalorieStr);
                } else {
                    log.warn("百度API返回的卡路里数据为空，食物：{}", foodName);
                }
            } catch (NumberFormatException e) {
                log.warn("解析百度API返回的卡路里数据失败，食物：{}，原始数据：{}", foodName, originalCalorieStr);
                calories = 0; // 解析失败时设为0
            }
        } else {
            log.info("百度API未返回食物 {} 的卡路里数据，设置为0", foodName);
        }
        
        // 设置到DTO中
        foodDTO.setCalories(calories);
        foodDTO.setBaiduCalorie(originalCalorieStr); // 保存原始字符串
    }
} 