package com.calorie.controller;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.calorie.common.CommonResult;
import com.calorie.dto.FoodDTO;
import com.calorie.entity.BaiduRecognitionDetail;
import com.calorie.entity.ImageRecognition;
import com.calorie.entity.MealRecord;
import com.calorie.service.BaiduRecognitionDetailService;
import com.calorie.service.ImageRecognitionService;
import com.calorie.service.MealRecordService;
import com.calorie.service.MinioFileService;
import com.calorie.service.RecognitionService;
import com.calorie.util.FileUploadUtil;
import com.calorie.vo.FoodRecognitionVO;
import com.calorie.vo.RecognitionResultVO;

import lombok.extern.slf4j.Slf4j;

/**
 * AI识别控制器
 */
@Slf4j
@RestController
@RequestMapping("/ai")
public class AIRecognitionController {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;
    
    @Autowired
    private RecognitionService recognitionService;
    
    @Autowired
    private ImageRecognitionService imageRecognitionService;
    
    @Autowired
    private BaiduRecognitionDetailService baiduDetailService;
    
    @Autowired
    private MealRecordService mealRecordService;
    
    @Autowired
    private FileUploadUtil fileUploadUtil;
    
    @Autowired
    private MinioFileService minioFileService;

    /**
     * 上传图片进行菜品识别
     * 
     * @param file 图片文件
     * @param request HTTP请求对象
     * @return 识别结果
     */
    @PostMapping("/recognize")
    public CommonResult<Map<String, Object>> recognizeFood(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {


        if (file.isEmpty()) {
            return CommonResult.failed("请选择图片文件");
        }
        
        // 从认证拦截器获取用户ID
        Integer userId = (Integer) request.getAttribute("userId");
        
        // 获取文件名、类型等信息
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        log.info("上传图片进行识别：文件名={}, 类型={}, 大小={}KB, 用户ID={}", 
                originalFilename, contentType, file.getSize() / 1024, userId);
        
        // 图片格式校验
        if (contentType == null || !contentType.startsWith("image/")) {
            return CommonResult.failed("只支持图片文件");
        }
        
        File tempFile = null;  // 声明临时文件变量，确保finally块可以访问
        try {
            log.info("开始上传图片到MinIO：{}", originalFilename);
            
            // 使用MinIO存储图片
            String imageUrl = minioFileService.uploadFile(file, "food");
            log.info("图片上传到MinIO成功，访问URL: {}", imageUrl);
            
            // 同时为了AI识别，仍需要保存临时本地文件
            // 获取项目根目录
            String rootPath = new File(".").getAbsolutePath();
            if (rootPath.endsWith(".")) {
                rootPath = rootPath.substring(0, rootPath.length() - 1);
            }
            
            // 生成当前日期目录
            String datePath = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String folder = "temp";  // 临时文件夹
            String uuid = java.util.UUID.randomUUID().toString().replaceAll("-", "");
            String suffix = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = uuid + suffix;
            
            // 完整的临时目录
            String targetDir = rootPath + File.separator + "uploads" + File.separator + folder + File.separator + datePath;
            java.nio.file.Path dirPath = java.nio.file.Paths.get(targetDir);
            
            // 确保目录存在
            java.nio.file.Files.createDirectories(dirPath);
            
            // 生成临时文件路径
            java.nio.file.Path tempFilePath = dirPath.resolve(fileName);
            tempFile = tempFilePath.toFile();
            
            log.info("将文件复制到临时目录: {}", tempFile.getAbsolutePath());
            
            // 复制文件到临时目录用于AI识别
            file.transferTo(tempFile);
            
            // 获取临时文件的绝对路径用于AI识别
            String absoluteFilePath = tempFile.getAbsolutePath();
            log.info("临时文件路径: {}", absoluteFilePath);
            
            // 调用识别服务，使用文件路径而不是MultipartFile
            log.info("开始调用百度AI菜品识别，使用文件路径：{}", absoluteFilePath);
            FoodRecognitionVO result = recognitionService.recognizeFoodFromPath(absoluteFilePath);
            
            if (!result.getSuccess()) {
                log.error("菜品识别失败: {}", result.getMessage());
                return CommonResult.failed(result.getMessage());
            }
            
            log.info("菜品识别成功，识别出 {} 种食物", result.getFoods() != null ? result.getFoods().size() : 0);
            
            // 修复result中返回的foods为null的情况
            if (result.getFoods() == null) {
                result.setFoods(new java.util.ArrayList<>());
                log.warn("菜品识别结果foods为null");
            }
            
            // 保留置信度前三的食物供用户选择
            if (!result.getFoods().isEmpty()) {
                // 按置信度排序
                List<FoodDTO> sortedFoods = result.getFoods().stream()
                        .sorted((a, b) -> Double.compare(b.getProbability(), a.getProbability()))
                        .collect(Collectors.toList());
                
                // 保留前三个（或实际数量，如果少于3个）
                int maxCount = Math.min(3, sortedFoods.size());
                List<FoodDTO> topThreeFoods = sortedFoods.subList(0, maxCount);
                result.setFoods(topThreeFoods);
                
                log.info("返回置信度前{}的食物供用户选择: {}", maxCount, 
                        topThreeFoods.stream()
                                .map(food -> food.getName() + "(" + String.format("%.1f", food.getProbability()) + "%)")
                                .collect(Collectors.joining(", ")));
            }
            
            // 保存识别记录
            ImageRecognition recognition = new ImageRecognition();
            recognition.setUserId(userId);
            recognition.setImageUrl(imageUrl);
            recognition.setProvider("baidu");
            recognition.setStatus(1); // 成功
            
            // 保存识别结果到数据库
            log.info("开始保存识别结果到数据库");
            Long recognitionId = imageRecognitionService.saveRecognitionResult(recognition, result);
            
            // 返回结果
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("recognitionId", recognitionId);
            responseMap.put("imageUrl", imageUrl);
            responseMap.put("foods", result.getFoods());

            log.info("识别结果返回，识别ID: {}", recognitionId);
            return CommonResult.success(responseMap);
        } catch (IOException e) {
            log.error("图片上传失败", e);
            return CommonResult.failed("图片上传失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("食物识别失败", e);
            return CommonResult.failed("识别失败: " + e.getMessage());
        } finally {
            // 确保临时文件被清理
            if (tempFile != null && tempFile.exists()) {
                try {
                    tempFile.delete();
                    log.info("临时文件已清理: {}", tempFile.getAbsolutePath());
                } catch (Exception ex) {
                    log.warn("清理临时文件失败: {}", ex.getMessage());
                }
            }
        }
    }
    
    /**
     * 获取识别结果详情
     * 
     * @param recognitionId 识别记录ID
     * @return 识别详情
     */
    @GetMapping("/detail/{recognitionId}")
    public CommonResult<Map<String, Object>> getRecognitionDetail(@PathVariable Long recognitionId) {
        // 获取识别记录
        ImageRecognition recognition = imageRecognitionService.getById(recognitionId);
        if (recognition == null) {
            return CommonResult.failed("识别记录不存在");
        }
        
        // 获取识别详情
        List<BaiduRecognitionDetail> details = baiduDetailService.getByRecognitionId(recognitionId);
        if (details.isEmpty()) {
            return CommonResult.failed("识别详情不存在");
        }
        
        // 转换为前端需要的格式，返回置信度前三的食物
        List<Map<String, Object>> foodList = details.stream()
                .sorted((a, b) -> b.getProbability().compareTo(a.getProbability()))
                .limit(3)  // 取前三个
                .map(detail -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", detail.getId());
                    map.put("name", detail.getFoodName());
                    map.put("calories", detail.getCalories());
                    map.put("probability", detail.getProbability());
                    map.put("imageUrl", detail.getImageUrl() != null ? detail.getImageUrl() : "");
                    map.put("description", detail.getDescription() != null ? detail.getDescription() : "");
                    // 默认不选中，让用户自己选择
                    map.put("selected", false);
                    return map;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("recognitionId", recognitionId);
        responseMap.put("imageUrl", recognition.getImageUrl());
        responseMap.put("foods", foodList);
        
        return CommonResult.success(responseMap);
    }
    
    /**
     * 选中识别结果中的食物
     * 
     * @param detailId 识别详情ID
     * @param selected 是否选中(1-是,0-否)
     * @return 操作结果
     */
    @PostMapping("/select/{detailId}")
    public CommonResult<Boolean> selectFood(
            @PathVariable Long detailId,
            @RequestParam("selected") Integer selected) {
        
        try {
            baiduDetailService.updateSelected(detailId, selected);
            return CommonResult.success(true);
        } catch (Exception e) {
            log.error("更新选中状态失败", e);
            return CommonResult.failed("操作失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据识别结果创建饮食记录
     * 
     * @param recognitionId 识别记录ID
     * @param request HTTP请求对象
     * @param mealType 餐食类型(1-早餐,2-午餐,3-晚餐,4-宵夜,5-零食)
     * @param remark 备注
     * @return 创建结果
     */
    @PostMapping("/create-meal")
    public CommonResult<Long> createMealRecord(
            @RequestParam(value = "recognitionId", required = true) Long recognitionId,
            HttpServletRequest request,
            @RequestParam("mealType") Integer mealType,
            @RequestParam(value = "selectedFoodIds", required = false) String selectedFoodIds,
            @RequestParam(value = "remark", required = false) String remark) {
        
        // 从认证拦截器获取用户ID
        Integer userId = (Integer) request.getAttribute("userId");
        
        // 打印接收到的参数
        log.info("创建饮食记录，参数：recognitionId={}, userId={}, mealType={}, selectedFoodIds={}, remark={}", 
                recognitionId, userId, mealType, selectedFoodIds, remark);
        
        try {
            // 获取识别记录
            ImageRecognition recognition = imageRecognitionService.getById(recognitionId);
            if (recognition == null) {
                return CommonResult.failed("识别记录不存在");
            }
            
            // 获取识别详情
            List<BaiduRecognitionDetail> details = baiduDetailService.getByRecognitionId(recognitionId);
            if (details.isEmpty()) {
                return CommonResult.failed("识别详情不存在");
            }
            
            // 处理用户选择的食物
            List<BaiduRecognitionDetail> selectedDetails = new java.util.ArrayList<>();
            
            if (selectedFoodIds != null && !selectedFoodIds.trim().isEmpty()) {
                // 解析用户选择的食物ID
                String[] foodIdArray = selectedFoodIds.split(",");
                for (String foodIdStr : foodIdArray) {
                    try {
                        Long foodId = Long.parseLong(foodIdStr.trim());
                        BaiduRecognitionDetail detail = details.stream()
                                .filter(d -> d.getId().equals(foodId))
                                .findFirst()
                                .orElse(null);
                        
                        if (detail != null) {
                            detail.setSelected(1);
                            selectedDetails.add(detail);
                            baiduDetailService.updateById(detail);
                        }
                    } catch (NumberFormatException e) {
                        log.warn("解析食物ID失败: {}", foodIdStr);
                    }
                }
            }
            
            // 如果用户没有选择任何食物，默认选择置信度最高的
            if (selectedDetails.isEmpty()) {
                BaiduRecognitionDetail highestConfidenceDetail = details.stream()
                        .sorted((a, b) -> b.getProbability().compareTo(a.getProbability()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("未找到识别详情"));
                
                highestConfidenceDetail.setSelected(1);
                baiduDetailService.updateById(highestConfidenceDetail);
                selectedDetails.add(highestConfidenceDetail);
            }
            
            // 计算总卡路里
            int totalCalories = selectedDetails.stream()
                    .mapToInt(detail -> detail.getCalories() != null ? detail.getCalories() : 0)
                    .sum();
            
            // 创建饮食记录
            MealRecord mealRecord = new MealRecord();
            mealRecord.setUserId(userId);
            mealRecord.setMealTime(java.time.LocalDateTime.now());
            mealRecord.setMealType(mealType);
            mealRecord.setTotalCalories(totalCalories);
            mealRecord.setImageUrl(recognition.getImageUrl());
            mealRecord.setRemark(remark);
            mealRecord.setAiRecognized(1); // 通过AI识别
            mealRecord.setRecognitionId(recognitionId);
            
            // 保存饮食记录
            Long mealId = mealRecordService.saveMealWithFoods(mealRecord, selectedDetails);
            
            return CommonResult.success(mealId);
        } catch (Exception e) {
            log.error("创建饮食记录失败", e);
            return CommonResult.failed("创建失败: " + e.getMessage());
        }
    }
    
    /**
     * 处理POST请求体中的参数，用于兼容不同的客户端发送方式
     */
    @PostMapping(value = "/create-meal", consumes = "application/json")
    public CommonResult<Long> createMealRecordJson(HttpServletRequest request, @RequestBody Map<String, Object> requestBody) {
        log.info("JSON方式接收创建饮食记录请求: {}", requestBody);
        
        // 从认证拦截器获取用户ID
        Integer userId = (Integer) request.getAttribute("userId");
        if (userId == null) {
            return CommonResult.failed("用户未登录");
        }
        
        // 提取参数
        Object recognitionIdObj = requestBody.get("recognitionId");
        Object mealTypeObj = requestBody.get("mealType");
        Object selectedFoodIdsObj = requestBody.get("selectedFoodIds");
        Object remarkObj = requestBody.get("remark");
        
        if (recognitionIdObj == null) {
            return CommonResult.failed("缺少必要参数: recognitionId");
        }
        
        if (mealTypeObj == null) {
            return CommonResult.failed("缺少必要参数: mealType");
        }
        
        try {
            // 转换参数类型
            Long recognitionId = recognitionIdObj instanceof Number ? 
                    ((Number) recognitionIdObj).longValue() : 
                    Long.parseLong(recognitionIdObj.toString());
            
            if (recognitionId == null || recognitionId <= 0) {
                return CommonResult.failed("识别ID无效");
            }
            
            Integer mealType = mealTypeObj instanceof Number ? 
                    ((Number) mealTypeObj).intValue() : 
                    Integer.parseInt(mealTypeObj.toString());
            
            String selectedFoodIds = selectedFoodIdsObj != null ? selectedFoodIdsObj.toString() : null;
            String remark = remarkObj != null ? remarkObj.toString() : null;
            
            // 调用原有方法处理
            return createMealRecord(recognitionId, request, mealType, selectedFoodIds, remark);
        } catch (NumberFormatException e) {
            log.error("参数类型转换失败", e);
            return CommonResult.failed("参数类型错误: " + e.getMessage());
        }
    }
} 