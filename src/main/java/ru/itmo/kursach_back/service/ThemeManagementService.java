package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.entity.GenerationTheme;
import ru.itmo.kursach_back.repository.GenerationThemeRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ThemeManagementService {

    private final GenerationThemeRepository themeRepository;

        public List<GenerationTheme> getAllThemes() {
        return themeRepository.findAllByOrderByThemeNameAsc();
    }

        public List<GenerationTheme> getActiveThemes() {
        return themeRepository.findByIsActiveTrue();
    }

        public Optional<GenerationTheme> getThemeById(Integer themeId) {
        return themeRepository.findById(themeId);
    }

        @Transactional
    public GenerationTheme createTheme(GenerationTheme theme) {
        return themeRepository.save(theme);
    }

        @Transactional
    public GenerationTheme updateTheme(Integer themeId, GenerationTheme updatedTheme) {
        GenerationTheme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new RuntimeException("Theme not found with id: " + themeId));

        if (updatedTheme.getThemeName() != null) {
            theme.setThemeName(updatedTheme.getThemeName());
        }
        if (updatedTheme.getThemePromptTemplate() != null) {
            theme.setThemePromptTemplate(updatedTheme.getThemePromptTemplate());
        }
        if (updatedTheme.getIsActive() != null) {
            theme.setIsActive(updatedTheme.getIsActive());
        }

        return themeRepository.save(theme);
    }

        @Transactional
    public void deleteTheme(Integer themeId) {
        themeRepository.deleteById(themeId);
    }

    @Transactional
    public GenerationTheme toggleThemeStatus(Integer themeId) {
        GenerationTheme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new RuntimeException("Theme not found with id: " + themeId));

        theme.setIsActive(!theme.getIsActive());

        return themeRepository.save(theme);
    }
}

