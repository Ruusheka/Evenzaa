package com.example.facultymanagement.Repository;

import com.example.facultymanagement.Model.Faculty;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FacultyRepository extends MongoRepository<Faculty, String> {
    Faculty findByEmail(String email);
}