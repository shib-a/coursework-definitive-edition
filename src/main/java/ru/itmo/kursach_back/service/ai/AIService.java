package ru.itmo.kursach_back.service.ai;

import java.util.Map;

public interface AIService {

        byte[] generateImage(String prompt, Map<String, Object> parameters) throws AIGenerationException;

        boolean isAvailable();

        String getServiceName();

        Map<String, Integer> getMaxDimensions();

        default void validatePrompt(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt cannot be empty");
        }
        if (prompt.length() > 1000) {
            throw new IllegalArgumentException("Prompt is too long (max 1000 characters)");
        }
    }
}

