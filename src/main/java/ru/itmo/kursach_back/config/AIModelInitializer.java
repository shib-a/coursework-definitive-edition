package ru.itmo.kursach_back.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ru.itmo.kursach_back.entity.AiModel;
import ru.itmo.kursach_back.service.AiModelManagementService;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AIModelInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(AIModelInitializer.class);
    
    private final AiModelManagementService aiModelManagementService;
    
    @Value("${ai.model.dalle3.url}")
    private String dalle3Url;

    @Value("${ai.model.dalle2.url}")
    private String dalle2Url;

    @Value("${ai.model.sd35.url}")
    private String sd35Url;

    @Value("${ai.model.sd35flash.url}")
    private String sd35FlashUrl;

    @Value("${ai.model.mock.url}")
    private String mockUrl;
    
    @PostConstruct
    public void initializeAIModels() {
        logger.info("Initializing AI models in database...");
        
        try {
            insertOrUpdateModel(1, "DALL-E 3", dalle3Url, true);
            insertOrUpdateModel(2, "DALL-E 2", dalle2Url, true);
            insertOrUpdateModel(3, "Stable Diffusion 3.5", sd35Url, true);
            insertOrUpdateModel(4, "Stable Diffusion 3.5 Flash", sd35FlashUrl, true);
            insertOrUpdateModel(999, "Mock AI Service", mockUrl, true);

            List<AiModel> activeModels = aiModelManagementService.getActiveModels();
            logger.info("AI models initialized successfully. Total active models: {}", activeModels.size());

            for (AiModel model : activeModels) {
                logger.info("  - Model {}: {} ({})", 
                          model.getModelId(), 
                          model.getModelName(), 
                          model.getApiEndpoint());
            }
            
        } catch (Exception e) {
            logger.error("Error initializing AI models: {}", e.getMessage(), e);
            logger.warn("AI models may not be properly configured. Check database schema.");
        }
    }
    
    private void insertOrUpdateModel(Integer modelId, String modelName, String apiEndpoint, Boolean isActive) {
        try {
            Optional<AiModel> existingModel = aiModelManagementService.getModelById(modelId);
            
            if (existingModel.isPresent()) {
                AiModel model = existingModel.get();
                model.setModelName(modelName);
                model.setApiEndpoint(apiEndpoint);
                model.setIsActive(isActive);
                aiModelManagementService.updateModel(modelId, model);
                logger.debug("Updated AI model: {} (ID: {})", modelName, modelId);
            } else {
                AiModel model = new AiModel();
                model.setModelId(modelId);
                model.setModelName(modelName);
                model.setApiEndpoint(apiEndpoint);
                model.setIsActive(isActive);
                aiModelManagementService.createModel(model);
                logger.info("Inserted new AI model: {} (ID: {})", modelName, modelId);
            }
        } catch (Exception e) {
            logger.error("Error inserting/updating model {} ({}): {}", modelId, modelName, e.getMessage());
        }
    }
}

