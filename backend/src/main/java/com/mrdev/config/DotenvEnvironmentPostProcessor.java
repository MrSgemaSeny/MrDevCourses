package com.mrdev.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Dotenv loader for local development.
 * Automatically loads key-value pairs from .env into Spring Environment property sources
 * and System properties without requiring hardcoded secrets in YAML or source code.
 */

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File[] candidateFiles = new File[]{
                new File(".env"),
                new File("../.env"),
                new File("backend/.env"),
                new File(System.getProperty("user.dir"), ".env"),
                new File(System.getProperty("user.dir"), "backend/.env"),
                new File(System.getProperty("user.dir"), "../.env")
        };

        for (File file : candidateFiles) {
            if (file.exists() && file.isFile()) {
                Map<String, Object> envMap = parseDotenvFile(file);
                if (!envMap.isEmpty()) {
                    for (Map.Entry<String, Object> entry : envMap.entrySet()) {
                        if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                            System.setProperty(entry.getKey(), String.valueOf(entry.getValue()));
                        }
                    }
                    environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));
                }
                break;
            }
        }
    }

    private Map<String, Object> parseDotenvFile(File file) {
        Map<String, Object> result = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int equalsIndex = line.indexOf('=');
                if (equalsIndex > 0) {
                    String key = line.substring(0, equalsIndex).trim();
                    String value = line.substring(equalsIndex + 1).trim();
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }
                    result.put(key, value);
                }
            }
        } catch (Exception ignored) {
        }
        return result;
    }
}
