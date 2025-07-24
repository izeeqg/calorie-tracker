# 餐食类型更新日志

## 更新时间
2025-06-11

## 更新内容
**目标：** 去掉备注功能，将餐食类型从"早餐、午餐、晚餐、加餐"改为"早餐、午餐、晚餐、宵夜、零食"

## 前端修改

### 1. 常量定义更新
- **文件：** `utils/constants.js`
- **修改：**
  - 更新 `MEAL_TYPE` 枚举：添加 `MIDNIGHT_SNACK: 4` 和 `SNACK: 5`
  - 更新 `MEAL_TYPE_TEXT` 映射：`4: '宵夜', 5: '零食'`

### 2. AI识别结果页面
- **文件：** `pages/foodAI/result.js`
- **修改：**
  - 更新 `mealTypes` 数组，添加"宵夜"和"零食"选项
  - 移除 `remark` 字段和相关处理函数 `inputRemark`
  - 修改保存请求，传递空字符串作为备注

- **文件：** `pages/foodAI/result.wxml`
- **修改：**
  - 移除备注输入框的表单项

### 3. AI识别页面
- **文件：** `pages/foodAI/index.js`
- **修改：**
  - 更新 `mealTypes` 数组
  - 移除 `remark` 字段
  - 修改保存请求参数

### 4. 历史记录页面
- **文件：** `pages/history/index.js` 和 `pages/history/history.js`
- **修改：**
  - 更新 `getMealTypeText` 函数支持新的餐食类型
  - 更新卡路里统计逻辑，包含5种餐食类型
  - 更新餐次顺序数组：`[1, 2, 3, 4, 5]`

- **文件：** `pages/history/index.wxss`
- **修改：**
  - 添加新的餐食类型颜色样式：
    - `.meal-indicator-4`：宵夜 - 紫色 (#9C27B0)
    - `.meal-indicator-5`：零食 - 蓝色 (#2196F3)

### 5. 首页
- **文件：** `pages/index/index.js`
- **修改：**
  - 更新 `getMealTypeIcon` 函数，为宵夜添加月亮图标
  - 更新卡路里统计逻辑

### 6. 详情页面
- **文件：** `pages/detail/detail.js` 和 `pages/detail/index.js`
- **修改：**
  - 使用常量定义的餐食类型文本映射

### 7. 临时文件清理
- **文件：** `pages/foodAI/result_temp/`
- **修改：**
  - 同步更新临时文件夹中的所有相关代码

## 后端修改

### 1. 实体类更新
- **文件：** `entity/MealRecord.java`
- **修改：**
  - 更新注释：`餐食类型(1-早餐,2-午餐,3-晚餐,4-宵夜,5-零食)`

### 2. 常量定义
- **文件：** `common/Constants.java`
- **修改：**
  - 更新 `MealType` 类：
    - `MIDNIGHT_SNACK = 4`（宵夜）
    - `SNACK = 5`（零食）

### 3. 控制器更新
- **文件：** `controller/AIRecognitionController.java`
- **修改：**
  - 更新注释中的餐食类型说明

### 4. 数据库表结构
- **文件：** `resources/db/init.sql`
- **修改：**
  - 更新 `meal_record` 表的 `meal_type` 字段注释
  - 更新 `user_statistics` 表：
    - 添加 `midnight_snack_calories` 字段（宵夜卡路里）
    - 保留 `snack_calories` 字段（零食卡路里）

### 5. 统计实体类
- **文件：** `entity/UserStatistics.java`
- **修改：**
  - 添加 `midnightSnackCalories` 字段
  - 保留 `snackCalories` 字段

## 餐食类型映射表

| 类型ID | 类型名称 | 图标 | 颜色 |
|--------|----------|------|------|
| 1 | 早餐 | sunrise | 绿色 (#4CAF50) |
| 2 | 午餐 | sunny-o | 橙色 (#F6AD55) |
| 3 | 晚餐 | star-o | 红色 (#FF5A5F) |
| 4 | 宵夜 | moon-o | 紫色 (#9C27B0) |
| 5 | 零食 | like-o | 蓝色 (#2196F3) |

## 注意事项

1. **数据兼容性：** 现有数据库中的记录仍然兼容，原有的"加餐"（类型4）数据在显示时会被当作"宵夜"处理
2. **备注功能：** 完全移除了备注输入功能，所有新记录的备注字段将为空字符串
3. **前端显示：** 所有使用餐食类型的页面都已更新，支持新的5种类型
4. **后端验证：** 后端代码已更新支持1-5的餐食类型值

## 测试建议

1. 测试AI识别后的餐食类型选择功能
2. 验证历史记录页面的餐食类型显示和颜色
3. 检查统计功能是否正确计算各餐次的卡路里
4. 确认备注功能已完全移除
5. 测试新旧数据的兼容性 