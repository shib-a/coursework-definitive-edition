package ru.itmo.kursach_back.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.kursach_back.entity.ImageData;
import ru.itmo.kursach_back.repository.ImageDataRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class ImageService {

    private final ImageDataRepository<ImageData, Integer> imageDataRepository;
    private static final String UPLOAD_DIR = "uploads/images/";

    public ImageService(ImageDataRepository<ImageData, Integer> imageDataRepository) {
        this.imageDataRepository = imageDataRepository;

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory", e);
        }
    }

    public ImageData saveImage(MultipartFile file, Integer uploaderId, String title, String description) throws IOException {
        if (!validateFile(file)) {
            throw new IllegalArgumentException("Invalid file");
        }

        String uuid = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".png";

        String filename = uuid + extension;
        Path filepath = Paths.get(UPLOAD_DIR, filename);

        Files.write(filepath, file.getBytes());

        ImageData imageData = new ImageData();
        imageData.setUuid(uuid);
        imageData.setUploaderId(uploaderId);
        imageData.setTitle(title != null && !title.trim().isEmpty() ? title : "Untitled");
        imageData.setDescription(description != null ? description : "");
        imageData.setSize(Math.toIntExact(file.getSize()));
        imageData.setMimeType(file.getContentType() != null ? file.getContentType() : "image/png");
        imageData.setStoragePath(filepath.toString());
        imageData.setCreatedAt(LocalDateTime.now());

        return imageDataRepository.save(imageData);
    }

    public List<Map<String, Object>> getUserImages(Integer userId) {
        Iterable<ImageData> images = imageDataRepository.findAll();

        return StreamSupport.stream(images.spliterator(), false)
                .filter(img -> img.getUploaderId() != null && img.getUploaderId().equals(userId))
                .map(img -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("imageId", img.getImgdId());
                    map.put("imageUrl", "/api/images/" + img.getImgdId() + "/file");
                    map.put("title", img.getTitle() != null ? img.getTitle() : "Image " + img.getImgdId());
                    map.put("description", img.getDescription() != null ? img.getDescription() : "");
                    map.put("uploadedDate", img.getCreatedAt());
                    map.put("size", img.getSize());
                    map.put("mimeType", img.getMimeType());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getImageById(Integer imageId, Integer userId) {
        Optional<ImageData> optionalImage = imageDataRepository.findById(imageId);

        if (optionalImage.isEmpty()) {
            return null;
        }

        ImageData img = optionalImage.get();

        if (!img.getUploaderId().equals(userId)) {
            return null;
        }

        Map<String, Object> map = new HashMap<>();
        map.put("imageId", img.getImgdId());
        map.put("imageUrl", "/api/images/" + img.getImgdId() + "/file");
        map.put("title", img.getTitle() != null ? img.getTitle() : "Image " + img.getImgdId());
        map.put("description", img.getDescription() != null ? img.getDescription() : "");
        map.put("uploadedDate", img.getCreatedAt());
        map.put("size", img.getSize());
        map.put("mimeType", img.getMimeType());

        return map;
    }

    public boolean deleteImage(Integer imageId, Integer userId) {
        Optional<ImageData> optionalImage = imageDataRepository.findById(imageId);

        if (optionalImage.isEmpty()) {
            return false;
        }

        ImageData img = optionalImage.get();

        if (!img.getUploaderId().equals(userId)) {
            return false;
        }

        try {
            Path filepath = Paths.get(img.getStoragePath());
            Files.deleteIfExists(filepath);
        } catch (IOException e) {

            System.err.println("Failed to delete image file: " + e.getMessage());
        }

        imageDataRepository.deleteById(imageId);

        return true;
    }

    public byte[] getImageFile(Integer imageId) throws IOException {
        Optional<ImageData> optionalImage = imageDataRepository.findById(imageId);

        if (optionalImage.isEmpty()) {
            return null;
        }

        ImageData img = optionalImage.get();
        Path filepath = Paths.get(img.getStoragePath());

        if (!Files.exists(filepath)) {
            return null;
        }

        return Files.readAllBytes(filepath);
    }

    public boolean validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return false;
        }

        String contentType = file.getContentType();
        return contentType != null &&
               (contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp"));
    }

        public List<Map<String, Object>> getPublicImages() {
        List<ImageData> images = imageDataRepository.findByIsPublicTrueOrderByCreatedAtDesc();

        return images.stream()
                .map(img -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("imageId", img.getImgdId());
                    map.put("imageUrl", "/api/images/" + img.getImgdId() + "/file");
                    map.put("title", img.getTitle() != null ? img.getTitle() : "Image " + img.getImgdId());
                    map.put("description", img.getDescription() != null ? img.getDescription() : "");
                    map.put("uploadedDate", img.getCreatedAt());
                    map.put("size", img.getSize());
                    map.put("mimeType", img.getMimeType());
                    if (img.getUploader() != null) {
                        map.put("uploaderUsername", img.getUploader().getUsername());
                    }
                    return map;
                })
                .collect(Collectors.toList());
    }

        public Map<String, Object> updateImageVisibility(Integer imageId, Integer userId, Boolean isPublic) {
        Optional<ImageData> optionalImage = imageDataRepository.findById(imageId);

        if (optionalImage.isEmpty()) {
            throw new RuntimeException("Image not found");
        }

        ImageData img = optionalImage.get();

        if (!img.getUploaderId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        img.setIsPublic(isPublic);
        imageDataRepository.save(img);

        Map<String, Object> map = new HashMap<>();
        map.put("imageId", img.getImgdId());
        map.put("imageUrl", "/api/images/" + img.getImgdId() + "/file");
        map.put("title", img.getTitle());
        map.put("description", img.getDescription());
        map.put("isPublic", img.getIsPublic());
        map.put("uploadedDate", img.getCreatedAt());

        return map;
    }
}
