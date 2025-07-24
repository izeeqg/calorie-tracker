-- 为百度AI识别记录详情表添加原始卡路里字段
-- 执行时间：2024-12-19

-- 添加百度API返回的原始卡路里值字段
ALTER TABLE `baidu_recognition_detail` 
ADD COLUMN `baidu_calorie` VARCHAR(20) DEFAULT NULL COMMENT '百度API返回的原始卡路里值' 
AFTER `calories`;

-- 为了保持数据一致性，可以选择性地为现有记录填充默认值
-- UPDATE `baidu_recognition_detail` SET `baidu_calorie` = CAST(`calories` AS CHAR) WHERE `baidu_calorie` IS NULL; 