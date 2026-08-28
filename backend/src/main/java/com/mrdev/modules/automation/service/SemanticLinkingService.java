package com.mrdev.modules.automation.service;

import com.mrdev.modules.ai.rag.model.GlossaryEmbedding;
import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.service.EmbeddingService;
import com.mrdev.modules.automation.dto.SemanticLinkDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SemanticLinkingService {

    private final GlossaryEmbeddingRepository glossaryEmbeddingRepository;
    private final EmbeddingService embeddingService;

    @Transactional(readOnly = true)
    public List<SemanticLinkDto> findSemanticLinksInText(Long courseId, String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<GlossaryEmbedding> terms = glossaryEmbeddingRepository.findByCourseId(courseId);
        List<SemanticLinkDto> links = new ArrayList<>();
        String lowerText = text.toLowerCase();

        for (GlossaryEmbedding gt : terms) {
            String lowerTerm = gt.getTerm().toLowerCase();
            if (lowerText.contains(lowerTerm)) {
                int idx = lowerText.indexOf(lowerTerm);
                int start = Math.max(0, idx - 40);
                int end = Math.min(text.length(), idx + lowerTerm.length() + 40);
                String snippet = text.substring(start, end);

                links.add(SemanticLinkDto.builder()
                        .term(gt.getTerm())
                        .category(gt.getCategory())
                        .definition(gt.getDefinition())
                        .similarityScore(1.0)
                        .previewSnippet(snippet)
                        .build());
            }
        }

        return links;
    }

    @Transactional
    public void syncGlossaryEmbeddings(Long courseId) {
        List<GlossaryEmbedding> terms = glossaryEmbeddingRepository.findByCourseId(courseId);
        for (GlossaryEmbedding gt : terms) {
            float[] vec = embeddingService.generateEmbedding(gt.getTerm() + ": " + gt.getDefinition());
            String vecStr = embeddingService.vectorToString(vec);
            gt.setEmbedding(vecStr);
            glossaryEmbeddingRepository.save(gt);
        }
        log.info("Synchronized {} glossary embeddings for courseId={}", terms.size(), courseId);
    }
}
