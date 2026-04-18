package com.example.stueventmanagement_application.studentManagement;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "*")
public class FacultyManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(FacultyManagementApplication.class, args);
    }

}
