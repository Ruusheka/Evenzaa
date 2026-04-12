package com.example.studentmanagement.Repository;

import com.example.studentmanagement.Model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<com.example.studentmanagement.Model.Student, String> {
    Student findByEmail(String email);
}