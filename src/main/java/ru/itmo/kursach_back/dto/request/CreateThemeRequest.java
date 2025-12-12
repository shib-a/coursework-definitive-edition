package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateThemeRequest {

    @NotBlank(message = "Theme name is required")
    @Size(max = 100, message = "Theme name must be less than 100 characters")
    private String themeName;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private Boolean isActive = true;
}

