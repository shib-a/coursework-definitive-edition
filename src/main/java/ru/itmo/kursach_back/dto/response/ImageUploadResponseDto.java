package ru.itmo.kursach_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageUploadResponseDto {
    private boolean isSuccessful;
    private String message;
}
