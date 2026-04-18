package com.example.stueventmanagement_application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example")
public class StuEventManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(StuEventManagementApplication.class, args);
    }

}
