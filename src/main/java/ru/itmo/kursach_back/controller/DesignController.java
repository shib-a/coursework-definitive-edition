package ru.itmo.kursach_back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.request.GenerateDesignRequestDto;
import ru.itmo.kursach_back.dto.response.DesignResponseDto;
import ru.itmo.kursach_back.service.DesignService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/designs")
@RequiredArgsConstructor
public class DesignController {
    private final DesignService designService;

        @PostMapping("/generate")
    public ResponseEntity<?> generateDesign(@Valid @RequestBody GenerateDesignRequestDto request) {
        try {
            DesignResponseDto response = designService.generateDesign(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating design: " + e.getMessage());
        }
    }

        @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyDesigns() {
        try {
            List<DesignResponseDto> designs = designService.getMyDesigns();
            return ResponseEntity.ok(designs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving designs: " + e.getMessage());
        }
    }

        @GetMapping("/{designId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDesignById(@PathVariable Integer designId) {
        try {
            DesignResponseDto design = designService.getDesignById(designId);
            return ResponseEntity.ok(design);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving design: " + e.getMessage());
        }
    }

        @DeleteMapping("/{designId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteDesign(@PathVariable Integer designId) {
        try {
            designService.deleteDesign(designId);
            return ResponseEntity.ok("Design deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting design: " + e.getMessage());
        }
    }

        @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getGenerationHistory() {
        try {
            List<DesignResponseDto> history = designService.getGenerationHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving history: " + e.getMessage());
        }
    }

        @GetMapping("/{designId}/image")
    public ResponseEntity<?> getDesignImage(@PathVariable Integer designId) {
        try {
            byte[] imageBytes = designService.getDesignImage(designId);
            if (imageBytes == null) {
                return ResponseEntity.notFound().build();
            }

            org.springframework.http.MediaType contentType = org.springframework.http.MediaType.IMAGE_PNG;
            if (imageBytes.length > 1) {
                if (imageBytes[0] == (byte)0xFF && imageBytes[1] == (byte)0xD8) {
                    contentType = org.springframework.http.MediaType.IMAGE_JPEG;
                } else if (imageBytes[0] == (byte)0x89 && imageBytes[1] == (byte)0x50) {
                    contentType = org.springframework.http.MediaType.IMAGE_PNG;
                }
            }

            return ResponseEntity.ok()
                    .contentType(contentType)
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error retrieving design image: " + e.getMessage()).getBytes());
        }
    }

        @GetMapping("/public")
    public ResponseEntity<?> getPublicDesigns() {
        try {
            List<DesignResponseDto> designs = designService.getPublicDesigns();
            return ResponseEntity.ok(designs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving public designs: " + e.getMessage());
        }
    }

        @PutMapping("/{designId}/visibility")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateDesignVisibility(
            @PathVariable Integer designId,
            @RequestBody Map<String, Boolean> visibilityUpdate) {
        try {
            Boolean isPublic = visibilityUpdate.get("isPublic");
            if (isPublic == null) {
                return ResponseEntity.badRequest().body("isPublic field is required");
            }
            DesignResponseDto response = designService.updateDesignVisibility(designId, isPublic);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating visibility: " + e.getMessage());
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularDesigns(@RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<Map<String, Object>> popularDesigns = designService.getPopularDesigns(limit);
            return ResponseEntity.ok(popularDesigns);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving popular designs: " + e.getMessage());
        }
    }

    @GetMapping("/{designId}/is-popular")
    public ResponseEntity<?> isDesignPopular(@PathVariable Integer designId) {
        try {
            Boolean isPopular = designService.isDesignPopular(designId);
            return ResponseEntity.ok(Map.of("designId", designId, "isPopular", isPopular));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking design popularity: " + e.getMessage());
        }
    }

    @GetMapping("/{designId}/stats")
    public ResponseEntity<?> getDesignStatistics(@PathVariable Integer designId) {
        try {
            Map<String, Object> stats = designService.getDesignStatistics(designId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving design statistics: " + e.getMessage());
        }
    }

    /**
     * Public endpoint to get active generation themes
     * Available for anonymous users
     */
    @GetMapping("/themes")
    public ResponseEntity<?> getActiveThemes() {
        try {
            List<Map<String, Object>> themes = designService.getActiveThemes();
            return ResponseEntity.ok(themes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving themes: " + e.getMessage());
        }
    }
}
