package ru.itmo.kursach_back.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service("localAIGatewayService")
public class LocalAIGatewayService extends AbstractAIService {

    @Value("${ai.gateway.url:http://localhost:9999}")
    private String gatewayUrl;

    @Value("${ai.gateway.provider:openai}")
    private String defaultProvider;

    @Value("${ai.gateway.model:dall-e-3}")
    private String model;

    @Value("${ai.gateway.enabled:false}")
    private boolean gatewayEnabled;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public LocalAIGatewayService(@Value("${ai.gateway.url:http://localhost:9999}") String gatewayUrl) {
        this.gatewayUrl = gatewayUrl;
        this.webClient = WebClient.builder()
                .baseUrl(gatewayUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(config -> config.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                        .build())
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected byte[] doGenerateImage(String prompt, Map<String, Object> parameters) throws Exception {
        if (!isAvailable()) {
            throw new AIGenerationException(
                "AI Gateway not available. Check if SSH tunnel is active: ssh -L 9999:localhost:9999 user@vps",
                getServiceName(),
                AIGenerationException.ErrorType.SERVICE_UNAVAILABLE
            );
        }

        Map<String, Object> params = mergeParameters(parameters);
        Map<String, Object> requestBody = new HashMap<>();
        
        requestBody.put("prompt", prompt);
        requestBody.put("model", model);
        requestBody.put("size", params.getOrDefault("size", "1024x1024"));
        requestBody.put("quality", params.getOrDefault("quality", "standard"));
        requestBody.put("style", params.getOrDefault("style", "vivid"));
        requestBody.put("provider", defaultProvider);

        String endpoint = "/api/ai/generate/" + defaultProvider;
        
        logger.info("Generating via AI Gateway: url={}, provider={}, model={}, prompt='{}'",
                   gatewayUrl, defaultProvider, model, prompt.substring(0, Math.min(50, prompt.length())));

        try {
            String responseJson = webClient.post()
                    .uri(endpoint)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            JsonNode responseNode = objectMapper.readTree(responseJson);
            
            if (!responseNode.has("success") || !responseNode.get("success").asBoolean()) {
                String errorMsg = responseNode.has("error") ? responseNode.get("error").asText() : "Unknown error";
                throw new AIGenerationException(
                    errorMsg,
                    getServiceName(),
                    AIGenerationException.ErrorType.UNKNOWN_ERROR
                );
            }

            if (!responseNode.has("imageBase64")) {
                throw new AIGenerationException(
                    "No image data in gateway response",
                    getServiceName(),
                    AIGenerationException.ErrorType.UNKNOWN_ERROR
                );
            }

            String imageBase64 = responseNode.get("imageBase64").asText();
            logger.info("Image received from gateway, base64 length: {}", imageBase64.length());

            return Base64.getDecoder().decode(imageBase64);

        } catch (WebClientResponseException e) {
            logger.error("Gateway error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw handleGatewayError(e);
        } catch (Exception e) {
            logger.error("Error communicating with AI Gateway: {}", e.getMessage(), e);
            throw new AIGenerationException(
                "Failed to generate via gateway: " + e.getMessage(),
                getServiceName(),
                AIGenerationException.ErrorType.SERVICE_UNAVAILABLE,
                e
            );
        }
    }

    private AIGenerationException handleGatewayError(WebClientResponseException e) {
        AIGenerationException.ErrorType errorType;
        String message;

        try {
            JsonNode errorNode = objectMapper.readTree(e.getResponseBodyAsString());
            message = errorNode.has("error") ? errorNode.get("error").asText() : e.getMessage();
            String type = errorNode.has("type") ? errorNode.get("type").asText() : "";

            errorType = switch (type) {
                case "API_KEY_MISSING", "API_KEY_INVALID" -> AIGenerationException.ErrorType.API_KEY_INVALID;
                case "RATE_LIMIT_EXCEEDED" -> AIGenerationException.ErrorType.RATE_LIMIT_EXCEEDED;
                case "CONTENT_POLICY_VIOLATION" -> AIGenerationException.ErrorType.CONTENT_POLICY_VIOLATION;
                default -> AIGenerationException.ErrorType.UNKNOWN_ERROR;
            };
        } catch (Exception parseEx) {
            message = "Gateway error: HTTP " + e.getStatusCode().value();
            errorType = AIGenerationException.ErrorType.UNKNOWN_ERROR;
        }

        return new AIGenerationException(message, getServiceName(), errorType, e);
    }

    @Override
    public boolean isAvailable() {
        if (!gatewayEnabled) {
            logger.debug("AI Gateway disabled in configuration");
            return false;
        }

        try {
            String healthResponse = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(3))
                    .block();

            JsonNode healthNode = objectMapper.readTree(healthResponse);
            boolean healthy = healthNode.has("status") && 
                            "healthy".equals(healthNode.get("status").asText());

            if (healthy) {
                logger.debug("AI Gateway is healthy at {}", gatewayUrl);
            } else {
                logger.warn("AI Gateway responded but status is not healthy");
            }

            return healthy;

        } catch (Exception e) {
            logger.debug("AI Gateway not available at {}: {}", gatewayUrl, e.getMessage());
            return false;
        }
    }

    @Override
    public String getServiceName() {
        return "AI Gateway (" + defaultProvider.toUpperCase() + "/" + model.toUpperCase() + ")";
    }

    @Override
    public Map<String, Integer> getMaxDimensions() {
        Map<String, Integer> dimensions = new HashMap<>();
        if (defaultProvider.equals("openai") && model.contains("dall-e-3")) {
            dimensions.put("width", 1792);
            dimensions.put("height", 1024);
        } else {
            dimensions.put("width", 1024);
            dimensions.put("height", 1024);
        }
        return dimensions;
    }

    @Override
    protected Map<String, Object> buildDefaultParameters() {
        Map<String, Object> defaults = super.buildDefaultParameters();
        defaults.put("model", model);
        defaults.put("provider", defaultProvider);
        
        if (defaultProvider.equals("openai") && model.contains("dall-e-3")) {
            defaults.put("quality", "standard");
            defaults.put("style", "vivid");
        }
        
        return defaults;
    }
}
