package com.calorie;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 卡路里跟踪应用程序启动类
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableScheduling
@MapperScan("com.calorie.mapper")
public class CalorieApplication {

    public static void main(String[] args) {
        SpringApplication.run(CalorieApplication.class, args);
    }
} 