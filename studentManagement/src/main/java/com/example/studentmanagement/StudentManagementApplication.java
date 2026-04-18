package com.example.studentmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean; // Add this import
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestTemplate; // Add this import

@SpringBootApplication
@CrossOrigin(origins = "http://localhost:3000")
public class StudentManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentManagementApplication.class, args);
    }

    // ADD THIS METHOD HERE
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
