package com.mrdev.modules.lesson.service;

import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.lesson.dto.LessonPitfallDto;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonPitfall;
import com.mrdev.modules.lesson.repository.LessonPitfallRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonPitfallService {

    private final LessonPitfallRepository lessonPitfallRepository;
    private final LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public List<LessonPitfallDto> getPitfallsByLesson(Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new ResourceNotFoundException("Lesson", "id", lessonId);
        }

        return lessonPitfallRepository.findAllByLessonIdOrderByOrderIndexAsc(lessonId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonPitfallDto createPitfall(Long lessonId, String title, String symptom, String solution, int orderIndex) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        LessonPitfall pitfall = LessonPitfall.builder()
                .lesson(lesson)
                .title(title)
                .errorSymptom(symptom)
                .solutionMarkdown(solution)
                .orderIndex(orderIndex)
                .build();

        return mapToDto(lessonPitfallRepository.save(pitfall));
    }

    private LessonPitfallDto mapToDto(LessonPitfall pitfall) {
        return LessonPitfallDto.builder()
                .id(pitfall.getId())
                .lessonId(pitfall.getLesson().getId())
                .title(pitfall.getTitle())
                .errorSymptom(pitfall.getErrorSymptom())
                .solutionMarkdown(pitfall.getSolutionMarkdown())
                .orderIndex(pitfall.getOrderIndex())
                .createdAt(pitfall.getCreatedAt())
                .build();
    }
}