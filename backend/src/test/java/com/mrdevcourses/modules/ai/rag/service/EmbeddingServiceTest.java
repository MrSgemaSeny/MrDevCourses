package com.mrdevcourses.modules.ai.rag.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmbeddingServiceTest {

    private EmbeddingService embeddingService;

    @BeforeEach
    void setUp() {
        embeddingService = new EmbeddingService();
    }

    @Test
    @DisplayName("generateEmbedding should generate 1536-dimensional normalized vector")
    void generateEmbedding_GeneratesNormalized1536Vector() {
        float[] vector = embeddingService.generateEmbedding("Spring Security JWT authentication token");

        assertThat(vector).hasSize(EmbeddingService.EMBEDDING_DIMENSION);

        double norm = 0.0;
        for (float v : vector) {
            norm += v * v;
        }
        assertThat(Math.sqrt(norm)).isCloseTo(1.0, org.assertj.core.data.Offset.offset(0.01));
    }

    @Test
    @DisplayName("calculateCosineSimilarity should return higher score for related text than unrelated")
    void calculateCosineSimilarity_DistinguishesSimilarTexts() {
        float[] v1 = embeddingService.generateEmbedding("Spring Boot and PostgreSQL database setup");
        float[] v2 = embeddingService.generateEmbedding("PostgreSQL database migrations with Flyway in Spring Boot");
        float[] v3 = embeddingService.generateEmbedding("Baking a chocolate cake in the oven recipe");

        double sim12 = embeddingService.calculateCosineSimilarity(v1, v2);
        double sim13 = embeddingService.calculateCosineSimilarity(v1, v3);

        assertThat(sim12).isGreaterThan(sim13);
    }

    @Test
    @DisplayName("vectorToString and stringToVector roundtrip correctly")
    void vectorConversion_RoundtripsAccurately() {
        float[] original = new float[]{0.123456f, -0.654321f, 0.987654f};
        String str = embeddingService.vectorToString(original);
        float[] reconstructed = embeddingService.stringToVector(str);

        assertThat(reconstructed).hasSize(3);
        assertThat(reconstructed[0]).isCloseTo(original[0], org.assertj.core.data.Offset.offset(0.0001f));
        assertThat(reconstructed[1]).isCloseTo(original[1], org.assertj.core.data.Offset.offset(0.0001f));
        assertThat(reconstructed[2]).isCloseTo(original[2], org.assertj.core.data.Offset.offset(0.0001f));
    }
}
