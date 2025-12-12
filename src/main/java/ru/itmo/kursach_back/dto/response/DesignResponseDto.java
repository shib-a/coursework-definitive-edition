package ru.itmo.kursach_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DesignResponseDto {
    private Integer designId;
    private String imageUrl;
    private String prompt;
    private String text; // Text included in design
    private String theme; // Design theme
    private Integer aiModelId; // AI model used
    private String status; // PROCESSING, COMPLETED, FAILED
    private Integer userId;
    private String ownerUsername; // Owner's username (for public gallery)
    private Boolean isPublic; // Visibility status
    private String createdAt;
}

