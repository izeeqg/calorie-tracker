# 🔧 登录问题诊断和解决指南

## 📋 问题描述

小程序登录时出现错误：
```
响应数据: {code: 1, message: "系统繁忙，请稍后再试", data: null}
```

## 🔍 问题诊断步骤

### 1. 检查后端服务状态

**步骤1.1：确认后端服务是否正常运行**
```bash
# 检查后端服务进程
ps aux | grep java

# 检查端口是否监听
netstat -nlp | grep 8080
# 或者
lsof -i :8080

# 查看后端日志
tail -f houduan/houduan/logs/spring.log
# 或者
journalctl -f -u calorie-tracker
```

**步骤1.2：测试后端API连通性**
```bash
# 测试后端健康检查
curl -X GET https://calorietracker.top/api/health
# 或使用本地地址
curl -X GET http://localhost:8080/api/health

# 测试登录接口（模拟请求）
curl -X POST https://calorietracker.top/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code",
    "nickName": "测试用户",
    "avatarUrl": "https://example.com/avatar.jpg",
    "gender": 1
  }'
```

### 2. 检查微信小程序配置

**步骤2.1：检查后端微信配置**

查看 `houduan/houduan/src/main/resources/application-prod.yml`：
```yaml
wx:
  miniapp:
    appid: your_wechat_appid      # 检查是否正确
    secret: your_wechat_secret    # 检查是否正确
```

**步骤2.2：验证微信配置是否有效**
```bash
# 在后端服务器上测试微信API
curl "https://api.weixin.qq.com/sns/jscode2session?appid=YOUR_APPID&secret=YOUR_SECRET&js_code=test&grant_type=authorization_code"
```

如果返回错误，说明微信配置有问题。

### 3. 检查数据库和Redis连接

**步骤3.1：检查MySQL连接**
```bash
# 测试MySQL连接
mysql -h localhost -u your_username -p your_database

# 检查数据库表是否存在
SHOW TABLES;
DESCRIBE user;
```

**步骤3.2：检查Redis连接**
```bash
# 测试Redis连接
redis-cli ping

# 检查Redis服务状态
systemctl status redis
```

### 4. 检查前端配置

**步骤4.1：确认API地址配置**

检查 `miniprogram-1/utils/constants.js`：
```javascript
// 确认API地址是否正确
const API_BASE_URL = 'https://calorietracker.top/api';
```

**步骤4.2：检查小程序网络权限**

在微信开发者工具中：
1. 打开"详情" → "本地设置"
2. 确认"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"已勾选（开发时）

## 🚀 具体解决方法

### 方案1：修复微信小程序配置

1. **获取正确的微信小程序配置**
   - 登录微信公众平台：https://mp.weixin.qq.com
   - 进入"开发" → "开发管理" → "开发设置"
   - 复制 AppID 和 AppSecret

2. **更新后端配置文件**
```yaml
# application-prod.yml
wx:
  miniapp:
    appid: 你的真实AppID
    secret: 你的真实AppSecret
```

3. **重启后端服务**
```bash
cd houduan/houduan
mvn clean package -Dmaven.test.skip=true
java -jar target/calorie-tracker-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 方案2：修复数据库连接问题

1. **检查数据库配置**
```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/calorie_tracker?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    username: 你的数据库用户名
    password: 你的数据库密码
```

2. **初始化数据库**
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE calorie_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 执行初始化脚本
mysql -u root -p calorie_tracker < houduan/houduan/src/main/resources/db/init.sql
```

### 方案3：临时绕过微信登录（调试用）

如果需要快速测试其他功能，可以临时修改后端代码：

**修改 UserServiceImpl.java 的 login 方法**：
```java
@Override
@Transactional(rollbackFor = Exception.class)
public UserInfoVO login(LoginDTO loginDTO) {
    try {
        // 临时跳过微信API调用，直接创建测试用户
        String openid = "test_openid_" + System.currentTimeMillis();
        
        // 查询用户是否存在
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getOpenid, openid));
        
        // 不存在则注册新用户
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname(loginDTO.getNickName());
            user.setAvatarUrl(loginDTO.getAvatarUrl());
            user.setGender(loginDTO.getGender());
            user.setTargetCalories(2000);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.insert(user);
        }
        
        // 生成token
        String token = jwtUtil.generateToken(user.getId());
        
        // 将用户信息存入Redis
        String userKey = Constants.RedisPrefix.USER_INFO + user.getId();
        redisTemplate.opsForValue().set(userKey, user, Constants.TimeValue.SECONDS_ONE_WEEK, TimeUnit.SECONDS);
        
        // 返回用户信息
        UserInfoVO userInfoVO = new UserInfoVO();
        BeanUtils.copyProperties(user, userInfoVO);
        userInfoVO.setToken(token);
        
        return userInfoVO;
        
    } catch (Exception e) {
        log.error("登录异常", e);
        throw new BusinessException("登录失败: " + e.getMessage(), Constants.BusinessCode.USER_ERROR);
    }
}
```

### 方案4：增强错误日志

**修改后端登录接口，增加详细日志**：

```java
@PostMapping("/login")
public R<UserInfoVO> login(@RequestBody @Valid LoginDTO loginDTO) {
    log.info("小程序用户登录开始：{}", loginDTO.getCode());
    try {
        UserInfoVO result = userService.login(loginDTO);
        log.info("小程序用户登录成功：userId={}", result.getId());
        return R.success(result);
    } catch (WxErrorException e) {
        log.error("微信API调用失败：{}", e.getMessage(), e);
        return R.error("微信登录失败: " + e.getMessage());
    } catch (BusinessException e) {
        log.error("业务异常：{}", e.getMessage(), e);
        return R.error(e.getMessage());
    } catch (Exception e) {
        log.error("系统异常", e);
        return R.error("系统繁忙，请稍后再试");
    }
}
```

## 🔍 日志查看命令

**实时查看后端日志**：
```bash
# 如果是jar包运行
tail -f logs/spring.log

# 如果是systemd服务
journalctl -f -u calorie-tracker

# 如果是Docker运行
docker logs -f container_name
```

**查看特定错误**：
```bash
# 查找登录相关错误
grep -n "login\|登录" logs/spring.log

# 查找微信相关错误  
grep -n "wx\|微信\|WeChat" logs/spring.log

# 查找数据库相关错误
grep -n "mysql\|database\|数据库" logs/spring.log
```

## 💡 常见问题和解决方案

### 问题1：微信API返回40013错误
**原因**：AppID无效
**解决**：检查并更正微信小程序AppID

### 问题2：微信API返回40125错误  
**原因**：AppSecret无效
**解决**：检查并更正微信小程序AppSecret

### 问题3：数据库连接超时
**原因**：数据库服务未启动或连接参数错误
**解决**：
```bash
systemctl start mysql
systemctl enable mysql
```

### 问题4：Redis连接失败
**原因**：Redis服务未启动
**解决**：
```bash
systemctl start redis
systemctl enable redis
```

### 问题5：SSL证书问题
**原因**：HTTPS证书配置问题
**解决**：检查Nginx SSL配置或使用HTTP进行测试

## 📞 获取更多帮助

如果以上方法都无法解决问题，请：

1. **收集完整日志**：
   ```bash
   # 导出完整的错误日志
   tail -n 1000 logs/spring.log > login_error.log
   ```

2. **检查系统资源**：
   ```bash
   # 检查内存使用
   free -h
   
   # 检查磁盘空间
   df -h
   
   # 检查CPU使用率
   top
   ```

3. **测试网络连通性**：
   ```bash
   # 测试微信API连通性
   ping api.weixin.qq.com
   
   # 测试本地数据库连通性
   telnet localhost 3306
   ```

记住：逐一排查每个可能的问题点，通过日志定位具体的错误原因是解决问题的关键！ 