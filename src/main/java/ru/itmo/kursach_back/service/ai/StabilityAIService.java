package ru.itmo.kursach_back.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service("stabilityAIService")
public class StabilityAIService extends AbstractAIService {

    private static final String API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

    @Value("${stability.api.key:}")
    private String apiKey;

    @Value("${stability.model:stable-diffusion-xl-1024-v1-0}")
    private String model;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public StabilityAIService() {
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected byte[] doGenerateImage(String prompt, Map<String, Object> parameters) throws Exception {
        if (!isAvailable()) {
            throw new AIGenerationException(
                "Stability AI not configured",
                getServiceName(),
                AIGenerationException.ErrorType.API_KEY_MISSING
            );
        }

        Map<String, Object> params = mergeParameters(parameters);
        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> textPrompt = new HashMap<>();
        textPrompt.put("text", prompt);
        textPrompt.put("weight", 1.0);
        requestBody.put("text_prompts", new Object[]{textPrompt});

        String size = (String) params.getOrDefault("size", "1024x1024");
        String[] dimensions = size.split("x");
        int width = Integer.parseInt(dimensions[0]);
        int height = dimensions.length > 1 ? Integer.parseInt(dimensions[1]) : width;

        requestBody.put("width", width);
        requestBody.put("height", height);
        requestBody.put("cfg_scale", 7.0);
        requestBody.put("steps", 30);
        requestBody.put("samples", 1);

        logger.info("Generating with Stability AI: {}x{}", width, height);

        try {
            String fullUrl = API_URL;

            String responseJson = webClient.post()
                    .uri(fullUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            JsonNode responseNode = objectMapper.readTree(responseJson);
            JsonNode artifacts = responseNode.get("artifacts");

            if (artifacts == null || !artifacts.isArray() || artifacts.isEmpty()) {
                throw new AIGenerationException(
                    "No image data",
                    getServiceName(),
                    AIGenerationException.ErrorType.UNKNOWN_ERROR
                );
            }

            JsonNode firstArtifact = artifacts.get(0);
            if (!firstArtifact.has("base64")) {
                throw new AIGenerationException(
                    "No base64 data",
                    getServiceName(),
                    AIGenerationException.ErrorType.UNKNOWN_ERROR
                );
            }

            String base64Image = firstArtifact.get("base64").asText();
            logger.info("Image generated successfully");

            return Base64.getDecoder().decode(base64Image);

        } catch (WebClientResponseException e) {
            AIGenerationException.ErrorType errorType = AIGenerationException.ErrorType.UNKNOWN_ERROR;
            if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                errorType = AIGenerationException.ErrorType.API_KEY_INVALID;
            } else if (e.getStatusCode().value() == 429) {
                errorType = AIGenerationException.ErrorType.RATE_LIMIT_EXCEEDED;
            }
            throw new AIGenerationException(e.getMessage(), getServiceName(), errorType, e);
        }
    }

    public boolean isAvailable() {
        boolean available = apiKey != null
                         && !apiKey.isEmpty()
                         && !apiKey.equals("your-api-key-here");
        return available;
    }

    public String getServiceName() {
        return "Stability AI " + model.toUpperCase();
    }

    public Map<String, Integer> getMaxDimensions() {
        Map<String, Integer> dimensions = new HashMap<>();
        dimensions.put("width", 1024);
        dimensions.put("height", 1024);
        return dimensions;
    }
}

