package com.mrdevcourses;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@EnableScheduling
@SpringBootApplication
public class MrDevCoursesApplication {

    public static void main(String[] args) {
        // Enforce UTC timezone across JVM
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(MrDevCoursesApplication.class, args);
    }
}
