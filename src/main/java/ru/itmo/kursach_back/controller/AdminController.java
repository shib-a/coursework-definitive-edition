package ru.itmo.kursach_back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.request.*;
import ru.itmo.kursach_back.dto.response.StatisticsResponse;
import ru.itmo.kursach_back.entity.AiModel;
import ru.itmo.kursach_back.entity.GenerationTheme;
import ru.itmo.kursach_back.entity.Product;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.service.*;
import ru.itmo.kursach_back.util.AuthAuthority;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserManagementService userManagementService;
    private final ThemeManagementService themeManagementService;
    private final AiModelManagementService aiModelManagementService;
    private final ProductService productService;


    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }


        @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

        @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Integer userId) {
        return userManagementService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userManagementService.searchUsersByUsername(query));
    }

        @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable AuthAuthority role) {
        return ResponseEntity.ok(userManagementService.getUsersByAuthority(role));
    }

    @PutMapping("/users/{userId}/block")
    public ResponseEntity<User> updateUserBlockStatus(
            @PathVariable Integer userId,
            @Valid @RequestBody BlockUserRequest request) {
        try {
            User user = userManagementService.updateUserBlockStatus(userId, request.getBlocked());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> changeUserRole(
            @PathVariable Integer userId,
            @RequestBody Map<String, AuthAuthority> body) {
        try {
            AuthAuthority newRole = body.get("authority");
            User user = userManagementService.changeUserAuthority(userId, newRole);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


        @GetMapping("/themes")
    public ResponseEntity<List<GenerationTheme>> getAllThemes() {
        return ResponseEntity.ok(themeManagementService.getAllThemes());
    }

        @GetMapping("/themes/{themeId}")
    public ResponseEntity<GenerationTheme> getThemeById(@PathVariable Integer themeId) {
        return themeManagementService.getThemeById(themeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        @PostMapping("/themes")
    public ResponseEntity<GenerationTheme> createTheme(@Valid @RequestBody CreateThemeRequest request) {
        GenerationTheme theme = new GenerationTheme();
        theme.setThemeName(request.getThemeName());
        theme.setThemePromptTemplate(request.getDescription() != null ? request.getDescription() : "");
        theme.setIsActive(request.getIsActive());

        GenerationTheme created = themeManagementService.createTheme(theme);
        return ResponseEntity.ok(created);
    }

        @PutMapping("/themes/{themeId}")
    public ResponseEntity<GenerationTheme> updateTheme(
            @PathVariable Integer themeId,
            @Valid @RequestBody CreateThemeRequest request) {
        try {
            GenerationTheme theme = new GenerationTheme();
            theme.setThemeName(request.getThemeName());
            theme.setThemePromptTemplate(request.getDescription() != null ? request.getDescription() : "");
            theme.setIsActive(request.getIsActive());

            GenerationTheme updated = themeManagementService.updateTheme(themeId, theme);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

        @DeleteMapping("/themes/{themeId}")
    public ResponseEntity<Map<String, String>> deleteTheme(@PathVariable Integer themeId) {
        try {
            themeManagementService.deleteTheme(themeId);
            return ResponseEntity.ok(Map.of("message", "Theme deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/themes/{themeId}/toggle")
    public ResponseEntity<GenerationTheme> toggleThemeStatus(@PathVariable Integer themeId) {
        try {
            GenerationTheme theme = themeManagementService.toggleThemeStatus(themeId);
            return ResponseEntity.ok(theme);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


        @GetMapping("/models")
    public ResponseEntity<List<AiModel>> getAllModels() {
        return ResponseEntity.ok(aiModelManagementService.getAllModels());
    }

        @GetMapping("/models/{modelId}")
    public ResponseEntity<AiModel> getModelById(@PathVariable Integer modelId) {
        return aiModelManagementService.getModelById(modelId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        @PostMapping("/models")
    public ResponseEntity<AiModel> createModel(@Valid @RequestBody CreateAiModelRequest request) {
        AiModel model = new AiModel();
        model.setModelName(request.getModelName());
        model.setApiEndpoint(request.getApiEndpoint());
        model.setIsActive(request.getIsActive());

        AiModel created = aiModelManagementService.createModel(model);
        return ResponseEntity.ok(created);
    }

        @PutMapping("/models/{modelId}")
    public ResponseEntity<AiModel> updateModel(
            @PathVariable Integer modelId,
            @Valid @RequestBody CreateAiModelRequest request) {
        try {
            AiModel model = new AiModel();
            model.setModelName(request.getModelName());
            model.setApiEndpoint(request.getApiEndpoint());
            model.setIsActive(request.getIsActive());

            AiModel updated = aiModelManagementService.updateModel(modelId, model);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

        @DeleteMapping("/models/{modelId}")
    public ResponseEntity<Map<String, String>> deleteModel(@PathVariable Integer modelId) {
        try {
            aiModelManagementService.deleteModel(modelId);
            return ResponseEntity.ok(Map.of("message", "AI Model deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/models/{modelId}/toggle")
    public ResponseEntity<AiModel> toggleModelStatus(@PathVariable Integer modelId) {
        try {
            AiModel model = aiModelManagementService.toggleModelStatus(modelId);
            return ResponseEntity.ok(model);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


        @PutMapping("/products/{productId}/price")
    public ResponseEntity<Product> updateProductPrice(
            @PathVariable Integer productId,
            @Valid @RequestBody UpdateProductPriceRequest request) {
        try {
            Product product = productService.updateProductPrice(productId, request.getPrice());
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

