package ru.itmo.kursach_back.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AIModelInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(AIModelInitializer.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostConstruct
    public void initializeAIModels() {
        logger.info("Initializing AI models in database...");
        
        try {

            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'is' AND table_name = 'ai_models'",
                Integer.class
            );
            
            if (count == null || count == 0) {
                logger.warn("Table is.ai_models does not exist. Skipping AI model initialization.");
                return;
            }

            insertOrUpdateModel(1, "DALL-E 3", "https://api.openai.com/v1/images/generations", true);
            insertOrUpdateModel(2, "DALL-E 2", "https://api.openai.com/v1/images/generations/dalle-2", true);
            insertOrUpdateModel(3, "Stable Diffusion 3.5", "https://api.stability.ai/v2beta/stable-image/sd3.5-flash", true);
            insertOrUpdateModel(4, "Stable Diffusion 3.5 Flash", "https://api.stability.ai/v2beta/stable-image/sd3.5-flash", true);
            insertOrUpdateModel(999, "Mock AI Service", "http://localhost/mock", true);

            Integer totalModels = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM ai_models WHERE is_active = true",
                Integer.class
            );
            
            logger.info("AI models initialized successfully. Total active models: {}", totalModels);

            jdbcTemplate.query(
                "SELECT model_id, model_name, api_endpoint FROM ai_models WHERE is_active = true ORDER BY model_id",
                (rs, rowNum) -> {
                    logger.info("  - Model {}: {} ({})", 
                              rs.getInt("model_id"), 
                              rs.getString("model_name"), 
                              rs.getString("api_endpoint"));
                    return null;
                }
            );
            
        } catch (Exception e) {
            logger.error("Error initializing AI models: {}", e.getMessage(), e);
            logger.warn("AI models may not be properly configured. Check database schema.");
        }
    }
    
    private void insertOrUpdateModel(Integer modelId, String modelName, String apiEndpoint, Boolean isActive) {
        try {

            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM is.ai_models WHERE model_id = ?",
                Integer.class,
                modelId
            );
            
            if (count != null && count > 0) {

                jdbcTemplate.update(
                    "UPDATE is.ai_models SET model_name = ?, api_endpoint = ?, is_active = ? WHERE model_id = ?",
                    modelName, apiEndpoint, isActive, modelId
                );
                logger.debug("Updated AI model: {} (ID: {})", modelName, modelId);
            } else {

                jdbcTemplate.update(
                    "INSERT INTO is.ai_models (model_id, model_name, api_endpoint, is_active) VALUES (?, ?, ?, ?)",
                    modelId, modelName, apiEndpoint, isActive
                );
                logger.info("Inserted new AI model: {} (ID: {})", modelName, modelId);
            }
        } catch (Exception e) {
            logger.error("Error inserting/updating model {} ({}): {}", modelId, modelName, e.getMessage());
        }
    }
}

