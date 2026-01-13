package ru.itmo.kursach_back.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.kursach_back.entity.ImageData;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.service.ImageService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;
    private final ru.itmo.kursach_back.service.CustomUserDetailsService userDetailsService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false, defaultValue = "Untitled") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            Authentication authentication) {

        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            User user = userDetailsService.getUserByLogin(username);

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No image file provided"));
            }

            ImageData savedImage = imageService.saveImage(file, user.getUserId(), title, description);

            Map<String, Object> response = new HashMap<>();
            response.put("imageId", savedImage.getImgdId());
            response.put("imageUrl", "/api/images/" + savedImage.getImgdId() + "/file");
            response.put("title", title);
            response.put("description", description);
            response.put("uploadedDate", savedImage.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyImages(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            User user = userDetailsService.getUserByLogin(username);
            List<Map<String, Object>> images = imageService.getUserImages(user.getUserId());

            return ResponseEntity.ok(images);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch images: " + e.getMessage()));
        }
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<?> getImageById(
            @PathVariable Integer imageId,
            Authentication authentication) {

        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            User user = userDetailsService.getUserByLogin(username);
            Map<String, Object> image = imageService.getImageById(imageId, user.getUserId());

            if (image == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(image);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch image: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteImage(
            @PathVariable Integer imageId,
            Authentication authentication) {

        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            User user = userDetailsService.getUserByLogin(username);
            boolean deleted = imageService.deleteImage(imageId, user.getUserId());

            if (!deleted) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete image: " + e.getMessage()));
        }
    }

    @GetMapping("/{imageId}/file")
    public ResponseEntity<?> getImageFile(@PathVariable Integer imageId) {
        try {

            byte[] imageBytes = imageService.getImageFile(imageId);

            if (imageBytes == null) {
                return ResponseEntity.notFound().build();
            }

            MediaType contentType = MediaType.IMAGE_PNG;
            if (imageBytes.length > 1) {

                if (imageBytes[0] == (byte)0xFF && imageBytes[1] == (byte)0xD8) {
                    contentType = MediaType.IMAGE_JPEG;
                } else if (imageBytes[0] == (byte)0x89 && imageBytes[1] == (byte)0x50) {
                    contentType = MediaType.IMAGE_PNG;
                } else if (imageBytes[0] == (byte)0x47 && imageBytes[1] == (byte)0x49) {
                    contentType = MediaType.IMAGE_GIF;
                }
            }

            return ResponseEntity.ok()
                    .contentType(contentType)
                    .body(imageBytes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Failed to fetch image file: " + e.getMessage()).getBytes());
        }
    }

        @GetMapping("/public")
    public ResponseEntity<?> getPublicImages() {
        try {
            List<Map<String, Object>> images = imageService.getPublicImages();
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch public images: " + e.getMessage()));
        }
    }

        @PutMapping("/{imageId}/visibility")
    public ResponseEntity<?> updateImageVisibility(
            @PathVariable Integer imageId,
            @RequestBody Map<String, Boolean> visibilityUpdate,
            Authentication authentication) {

        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            User user = userDetailsService.getUserByLogin(username);

            Boolean isPublic = visibilityUpdate.get("isPublic");
            if (isPublic == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "isPublic field is required"));
            }

            Map<String, Object> updatedImage = imageService.updateImageVisibility(imageId, user.getUserId(), isPublic);
            return ResponseEntity.ok(updatedImage);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update image visibility: " + e.getMessage()));
        }
    }
}
