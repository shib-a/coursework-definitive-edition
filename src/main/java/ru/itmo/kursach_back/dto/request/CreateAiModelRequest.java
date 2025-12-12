package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAiModelRequest {

    @NotBlank(message = "Model name is required")
    @Size(max = 100, message = "Model name must be less than 100 characters")
    private String modelName;

    @Size(max = 255, message = "API endpoint must be less than 255 characters")
    private String apiEndpoint;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private Boolean isActive = true;
}

