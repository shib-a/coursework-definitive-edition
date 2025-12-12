package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateDesignRequestDto {
    @NotBlank(message = "Prompt is required")
    private String prompt;

    private String text; // Optional text to include in design

    @NotNull(message = "AI model ID is required")
    private Integer aiModelId;

    private String theme; // Theme name (e.g., "CASUAL", "SPORT")

    private Integer variations; // Number of variations to generate

    private String style; // Additional style parameters
}

