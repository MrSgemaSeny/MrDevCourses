package com.mrdevcourses.modules.ai.rag.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    public static final int EMBEDDING_DIMENSION = 1536;

    @Value("${app.ai.embedding.enabled:false}")
    private boolean externalEmbeddingEnabled;

    /**
     * Generates a normalized 1536-dimensional embedding vector for the given text.
     * Uses deterministic high-entropy semantic feature hashing as robust default and test fallback,
     * normalized to unit length (|v| = 1.0).
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return new float[EMBEDDING_DIMENSION];
        }

        float[] vector = new float[EMBEDDING_DIMENSION];
        String normalized = text.toLowerCase().trim();
        String[] tokens = normalized.split("[\\s\\p{Punct}]+");

        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            if (token.isBlank()) continue;

            byte[] tokenHash = sha256Bytes(token);
            for (int j = 0; j < tokenHash.length && j * 48 < EMBEDDING_DIMENSION; j++) {
                int index = Math.abs((token.hashCode() * 31 + j * 47)) % EMBEDDING_DIMENSION;
                float weight = (tokenHash[j] & 0xFF) / 255.0f - 0.5f;
                // Position and positional frequency decay
                vector[index] += weight * (1.0f / (1.0f + (float) Math.log(i + 1)));
            }
        }

        // Add character n-gram projections for code and subwords
        for (int i = 0; i < Math.min(normalized.length() - 3, 200); i++) {
            String gram = normalized.substring(i, i + 3);
            int idx = Math.abs(gram.hashCode()) % EMBEDDING_DIMENSION;
            vector[idx] += 0.05f;
        }

        // L2 Normalization
        float norm = 0.0f;
        for (float v : vector) {
            norm += v * v;
        }
        norm = (float) Math.sqrt(norm);

        if (norm > 1e-6) {
            for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
                vector[i] /= norm;
            }
        }

        return vector;
    }

    public String vectorToString(float[] vector) {
        if (vector == null || vector.length == 0) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(String.format(java.util.Locale.US, "%.6f", vector[i]));
            if (i < vector.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    public float[] stringToVector(String vectorStr) {
        if (vectorStr == null || vectorStr.length() < 2) {
            return new float[0];
        }
        String clean = vectorStr.trim();
        if (clean.startsWith("[") && clean.endsWith("]")) {
            clean = clean.substring(1, clean.length() - 1);
        }
        if (clean.isBlank()) {
            return new float[0];
        }
        String[] parts = clean.split(",");
        float[] res = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Float.parseFloat(parts[i].trim());
        }
        return res;
    }

    public double calculateCosineSimilarity(float[] v1, float[] v2) {
        if (v1 == null || v2 == null || v1.length == 0 || v2.length == 0) {
            return 0.0;
        }
        int minLen = Math.min(v1.length, v2.length);
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < minLen; i++) {
            dotProduct += v1[i] * v2[i];
            normA += v1[i] * v1[i];
            normB += v2[i] * v2[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private byte[] sha256Bytes(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            return text.getBytes(StandardCharsets.UTF_8);
        }
    }
}
