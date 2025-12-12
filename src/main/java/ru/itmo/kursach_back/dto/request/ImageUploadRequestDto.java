package ru.itmo.kursach_back.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ImageUploadRequestDto {
    private MultipartFile file;
    private String metadata;
}
