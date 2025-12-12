package ru.itmo.kursach_back.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractAIService implements AIService {

    protected final Logger logger = LoggerFactory.getLogger(getClass());

    @Value("${ai.generation.timeout:60000}")
    protected long timeoutMs;

    @Value("${ai.generation.retry.attempts:3}")
    protected int retryAttempts;

    @Value("${ai.generation.retry.delay:1000}")
    protected long retryDelayMs;

        @Override
    public byte[] generateImage(String prompt, Map<String, Object> parameters) throws AIGenerationException {
        validatePrompt(prompt);

        if (!isAvailable()) {
            String detailedMessage = getServiceName() + " is not available or not configured. ";
            if (getServiceName().contains("OpenAI")) {
                detailedMessage += "Please set 'openai.api.key' in application.properties or use model ID 999 for Mock service.";
            } else {
                detailedMessage += "Service is not properly configured.";
            }

            logger.error("Service not available: {}", detailedMessage);

            throw new AIGenerationException(
                detailedMessage,
                getServiceName(),
                AIGenerationException.ErrorType.API_KEY_MISSING
            );
        }

        logger.info("Generating image with {}: prompt='{}', params={}", getServiceName(), prompt, parameters);

        Exception lastException = null;
        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                byte[] result = doGenerateImage(prompt, parameters);
                logger.info("Image generated successfully with {} on attempt {}", getServiceName(), attempt);
                return result;
            } catch (Exception e) {
                lastException = e;
                logger.warn("Generation attempt {} failed: {}", attempt, e.getMessage());

                if (attempt < retryAttempts) {
                    try {
                        Thread.sleep(retryDelayMs * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new AIGenerationException(
                            "Generation interrupted",
                            getServiceName(),
                            AIGenerationException.ErrorType.UNKNOWN_ERROR,
                            ie
                        );
                    }
                }
            }
        }

        throw new AIGenerationException(
            "Failed to generate image after " + retryAttempts + " attempts",
            getServiceName(),
            AIGenerationException.ErrorType.UNKNOWN_ERROR,
            lastException
        );
    }

    protected abstract byte[] doGenerateImage(String prompt, Map<String, Object> parameters) throws Exception;

    protected Map<String, Object> buildDefaultParameters() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("size", "1024x1024");
        defaults.put("quality", "standard");
        defaults.put("n", 1);
        return defaults;
    }

    protected Map<String, Object> mergeParameters(Map<String, Object> userParams) {
        Map<String, Object> merged = buildDefaultParameters();
        if (userParams != null) {
            merged.putAll(userParams);
        }
        return merged;
    }
}

