-- 创建数据库
CREATE DATABASE IF NOT EXISTS calorie_tracker DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE calorie_tracker;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` INT UNSIGNED AUTO_INCREMENT COMMENT '用户ID',
    `openid` VARCHAR(50) NOT NULL COMMENT '微信OpenID',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '用户昵称',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `gender` TINYINT DEFAULT 0 COMMENT '性别(0-未知，1-男，2-女)',
    `age` INT DEFAULT NULL COMMENT '年龄',
    `height` DECIMAL(5,2) DEFAULT NULL COMMENT '身高(cm)',
    `weight` DECIMAL(5,2) DEFAULT NULL COMMENT '体重(kg)',
    `target_calories` INT DEFAULT 2000 COMMENT '目标每日卡路里摄入量',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 食物分类表
CREATE TABLE IF NOT EXISTS `food_category` (
    `id` INT UNSIGNED AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '分类图标',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食物分类表';

-- 食物数据表
CREATE TABLE IF NOT EXISTS `food` (
    `id` INT UNSIGNED AUTO_INCREMENT COMMENT '食物ID',
    `name` VARCHAR(100) NOT NULL COMMENT '食物名称',
    `category_id` INT UNSIGNED NOT NULL COMMENT '分类ID',
    `calories` INT NOT NULL COMMENT '每100克卡路里含量',
    `protein` DECIMAL(5,2) DEFAULT 0 COMMENT '蛋白质(克/100克)',
    `fat` DECIMAL(5,2) DEFAULT 0 COMMENT '脂肪(克/100克)',
    `carbohydrate` DECIMAL(5,2) DEFAULT 0 COMMENT '碳水化合物(克/100克)',
    `fiber` DECIMAL(5,2) DEFAULT 0 COMMENT '纤维素(克/100克)',
    `sugar` DECIMAL(5,2) DEFAULT 0 COMMENT '糖分(克/100克)',
    `sodium` DECIMAL(5,2) DEFAULT 0 COMMENT '钠(毫克/100克)',
    `is_system` TINYINT DEFAULT 1 COMMENT '是否系统数据(0-否，1-是)',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '食物图片URL',
    `description` TEXT DEFAULT NULL COMMENT '食物描述',
    `baidu_tags` VARCHAR(255) DEFAULT NULL COMMENT '百度识别标签',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_name` (`name`),
    KEY `idx_baidu_tags` (`baidu_tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食物数据表';

-- 用户饮食记录表
CREATE TABLE IF NOT EXISTS `meal_record` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT '记录ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
    `meal_time` DATETIME NOT NULL COMMENT '进餐时间',
    `meal_type` TINYINT NOT NULL COMMENT '餐食类型(1-早餐,2-午餐,3-晚餐,4-宵夜,5-零食)',
    `total_calories` INT NOT NULL DEFAULT 0 COMMENT '总卡路里',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '饮食图片URL',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `ai_recognized` TINYINT DEFAULT 0 COMMENT '是否通过AI识别(0-否,1-是)',
    `recognition_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联的识别记录ID',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_time` (`user_id`, `meal_time`),
    KEY `idx_recognition` (`recognition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户饮食记录表';

-- 饮食记录详情表
CREATE TABLE IF NOT EXISTS `meal_food` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'ID',
    `meal_id` BIGINT UNSIGNED NOT NULL COMMENT '饮食记录ID',
    `food_id` INT UNSIGNED NOT NULL COMMENT '食物ID',
    `food_name` VARCHAR(100) NOT NULL COMMENT '食物名称(冗余)',
    `portion` DECIMAL(6,2) NOT NULL COMMENT '食用份量(克)',
    `calories` INT NOT NULL COMMENT '卡路里含量',
    `recognition_confidence` DECIMAL(5,2) DEFAULT NULL COMMENT '识别置信度',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_meal` (`meal_id`),
    KEY `idx_food` (`food_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='饮食记录详情表';

-- 图片识别记录表
CREATE TABLE IF NOT EXISTS `image_recognition` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT '识别记录ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
    `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
    `recognition_result` JSON NOT NULL COMMENT '识别结果JSON',
    `provider` VARCHAR(20) NOT NULL DEFAULT 'baidu' COMMENT '识别提供商(baidu,tflite等)',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态(0-处理中,1-成功,2-失败)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片识别记录表';

-- 百度AI识别记录详情表
CREATE TABLE IF NOT EXISTS `baidu_recognition_detail` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT '记录ID',
    `recognition_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的识别记录ID',
    `food_name` VARCHAR(100) NOT NULL COMMENT '识别的食物名称',
    `probability` DECIMAL(5,2) NOT NULL COMMENT '识别置信度',
    `calories` INT DEFAULT NULL COMMENT '匹配的卡路里值',
    `baidu_calorie` VARCHAR(20) DEFAULT NULL COMMENT '百度API返回的原始卡路里值',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '百科图片URL',
    `description` TEXT DEFAULT NULL COMMENT '百科描述',
    `selected` TINYINT DEFAULT 0 COMMENT '是否被用户选中(0-否,1-是)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_recognition` (`recognition_id`),
    KEY `idx_food_name` (`food_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='百度AI识别记录详情表';

-- 用户自定义食物表
CREATE TABLE IF NOT EXISTS `custom_food` (
    `id` INT UNSIGNED AUTO_INCREMENT COMMENT '自定义食物ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT '创建用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '食物名称',
    `category_id` INT UNSIGNED NOT NULL COMMENT '分类ID',
    `calories` INT NOT NULL COMMENT '每100克卡路里含量',
    `protein` DECIMAL(5,2) DEFAULT 0 COMMENT '蛋白质(克/100克)',
    `fat` DECIMAL(5,2) DEFAULT 0 COMMENT '脂肪(克/100克)',
    `carbohydrate` DECIMAL(5,2) DEFAULT 0 COMMENT '碳水化合物(克/100克)',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '食物图片URL',
    `is_public` TINYINT DEFAULT 0 COMMENT '是否公开(0-否,1-是)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户自定义食物表';

-- 数据统计表
CREATE TABLE IF NOT EXISTS `user_statistics` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT '统计ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
    `date` DATE NOT NULL COMMENT '统计日期',
    `total_calories` INT DEFAULT 0 COMMENT '总卡路里',
    `breakfast_calories` INT DEFAULT 0 COMMENT '早餐卡路里',
    `lunch_calories` INT DEFAULT 0 COMMENT '午餐卡路里',
    `dinner_calories` INT DEFAULT 0 COMMENT '晚餐卡路里',
    `midnight_snack_calories` INT DEFAULT 0 COMMENT '宵夜卡路里',
    `snack_calories` INT DEFAULT 0 COMMENT '零食卡路里',
    `protein` DECIMAL(6,2) DEFAULT 0 COMMENT '蛋白质总量(克)',
    `fat` DECIMAL(6,2) DEFAULT 0 COMMENT '脂肪总量(克)',
    `carbohydrate` DECIMAL(6,2) DEFAULT 0 COMMENT '碳水化合物总量(克)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户数据统计表';

-- 菜品百度标签映射表
CREATE TABLE IF NOT EXISTS `baidu_food_mapping` (
    `id` INT UNSIGNED AUTO_INCREMENT COMMENT '映射ID',
    `baidu_tag` VARCHAR(100) NOT NULL COMMENT '百度识别标签',
    `food_id` INT UNSIGNED NOT NULL COMMENT '关联的食物ID',
    `priority` INT DEFAULT 100 COMMENT '优先级(数字越小优先级越高)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_tag` (`baidu_tag`),
    KEY `idx_food` (`food_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品百度标签映射表';

-- 插入一些初始分类数据
INSERT INTO `food_category` (`name`, `description`, `icon`) VALUES 
('主食', '米饭、面条、馒头等', '/icons/staple.png'),
('肉类', '猪肉、牛肉、鸡肉等', '/icons/meat.png'),
('蔬菜', '各类蔬菜', '/icons/vegetable.png'),
('水果', '各类水果', '/icons/fruit.png'),
('零食', '点心、零食', '/icons/snack.png'),
('饮料', '各类饮料', '/icons/drink.png'),
('乳制品', '牛奶、酸奶、奶酪等', '/icons/dairy.png'),
('海鲜', '鱼、虾、蟹等', '/icons/seafood.png'),
('烘焙', '面包、蛋糕、饼干等', '/icons/bakery.png'),
('快餐', '汉堡、薯条、披萨等', '/icons/fastfood.png');

-- 插入一些常见食物数据
INSERT INTO `food` (`name`, `category_id`, `calories`, `protein`, `fat`, `carbohydrate`, `baidu_tags`) VALUES
('米饭', 1, 116, 2.6, 0.3, 25.6, '米饭,白米饭,大米饭'),
('馒头', 1, 223, 6.8, 1.2, 46.5, '馒头,白馒头,蒸馒头'),
('猪肉(瘦)', 2, 143, 20.7, 6.2, 0.0, '猪肉,瘦肉'),
('鸡胸肉', 2, 113, 24.0, 1.5, 0.0, '鸡胸肉,鸡胸脯肉'),
('西红柿', 3, 20, 0.8, 0.2, 4.2, '西红柿,番茄'),
('黄瓜', 3, 15, 0.6, 0.2, 3.1, '黄瓜,青瓜'),
('苹果', 4, 52, 0.3, 0.2, 13.7, '苹果,红苹果,青苹果'),
('香蕉', 4, 93, 1.0, 0.3, 23.5, '香蕉,牛奶蕉'),
('薯片', 5, 536, 6.3, 35.0, 51.0, '薯片,马铃薯片,薯条'),
('可乐', 6, 42, 0.0, 0.0, 10.6, '可乐,可口可乐,百事可乐'),
('牛奶', 7, 67, 3.5, 3.9, 4.8, '牛奶,纯牛奶,鲜牛奶'),
('三文鱼', 8, 206, 22.0, 13.0, 0.0, '三文鱼,鲑鱼'),
('汉堡包', 10, 300, 15.0, 13.0, 30.0, '汉堡,汉堡包,牛肉汉堡'),
('炸鸡', 10, 250, 25.0, 15.0, 8.0, '炸鸡,炸鸡腿,炸鸡翅'),
('面包', 9, 240, 9.0, 3.0, 45.0, '面包,吐司,吐司面包'),
('蛋糕', 9, 400, 5.0, 20.0, 50.0, '蛋糕,奶油蛋糕,巧克力蛋糕'),
('意大利面', 1, 220, 8.0, 1.0, 43.0, '意大利面,意面,意粉'),
('沙拉', 3, 120, 3.0, 8.0, 10.0, '沙拉,蔬菜沙拉,水果沙拉'),
('披萨', 10, 280, 12.0, 10.0, 35.0, '披萨,比萨,意式披萨'),
('寿司', 8, 150, 5.0, 0.5, 30.0, '寿司,日式寿司,寿司卷');

-- 插入百度标签映射数据
INSERT INTO `baidu_food_mapping` (`baidu_tag`, `food_id`, `priority`) VALUES
('米饭', 1, 10),
('白米饭', 1, 10),
('馒头', 2, 10),
('猪肉', 3, 10),
('瘦肉', 3, 20),
('鸡胸肉', 4, 10),
('西红柿', 5, 10),
('番茄', 5, 10),
('黄瓜', 6, 10),
('苹果', 7, 10),
('香蕉', 8, 10),
('薯片', 9, 10),
('可乐', 10, 10),
('可口可乐', 10, 10),
('牛奶', 11, 10),
('三文鱼', 12, 10),
('鲑鱼', 12, 20),
('汉堡', 13, 10),
('汉堡包', 13, 10),
('炸鸡', 14, 10),
('面包', 15, 10),
('吐司', 15, 20),
('蛋糕', 16, 10),
('意大利面', 17, 10),
('意面', 17, 20),
('沙拉', 18, 10),
('披萨', 19, 10),
('比萨', 19, 20),
('寿司', 20, 10); 