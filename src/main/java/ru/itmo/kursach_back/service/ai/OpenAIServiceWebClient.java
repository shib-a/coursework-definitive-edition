package ru.itmo.kursach_back.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service("openAIService")
public class OpenAIServiceWebClient extends AbstractAIService {

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.model:dall-e-3}")
    private String model;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OpenAIServiceWebClient(@Value("${openai.api.url}") String apiUrl) {
        this.apiUrl = apiUrl;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected byte[] doGenerateImage(String prompt, Map<String, Object> parameters) throws Exception {
        if (!isAvailable()) {
            throw new AIGenerationException(
                "OpenAI service not configured",
                getServiceName(),
                AIGenerationException.ErrorType.API_KEY_MISSING
            );
        }

        Map<String, Object> params = mergeParameters(parameters);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("prompt", prompt);
        requestBody.put("n", 1);
        requestBody.put("size", params.getOrDefault("size", "1024x1024"));

        if (model.contains("dall-e-3")) {
            requestBody.put("quality", params.getOrDefault("quality", "standard"));
            requestBody.put("style", params.getOrDefault("style", "vivid"));
        }

        requestBody.put("response_format", "url");

        logger.info("Generating image with OpenAI: model={}, size={}, prompt='{}'",
                   model, requestBody.get("size"), prompt);

        try {

            String responseJson = webClient.post()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            JsonNode responseNode = objectMapper.readTree(responseJson);
            JsonNode dataArray = responseNode.get("data");

            if (dataArray == null || !dataArray.isArray() || dataArray.isEmpty()) {
                throw new AIGenerationException(
                    "No image data in response",
                    getServiceName(),
                    AIGenerationException.ErrorType.UNKNOWN_ERROR
                );
            }

            String imageUrl = dataArray.get(0).get("url").asText();
            logger.info("Image generated successfully, downloading from: {}", imageUrl);

            return downloadImage(imageUrl);

        } catch (WebClientResponseException e) {
            throw handleWebClientError(e);
        } catch (Exception e) {
            logger.error("Error generating image: {}", e.getMessage(), e);
            throw new AIGenerationException(
                "Failed to generate image: " + e.getMessage(),
                getServiceName(),
                AIGenerationException.ErrorType.UNKNOWN_ERROR,
                e
            );
        }
    }

    private AIGenerationException handleWebClientError(WebClientResponseException e) {
        AIGenerationException.ErrorType errorType;
        String message;

        try {
            JsonNode errorNode = objectMapper.readTree(e.getResponseBodyAsString());
            JsonNode error = errorNode.get("error");
            message = error.get("message").asText();
            String type = error.has("type") ? error.get("type").asText() : "";

            if (e.getStatusCode().value() == 401) {
                errorType = AIGenerationException.ErrorType.API_KEY_INVALID;
            } else if (e.getStatusCode().value() == 429) {
                errorType = AIGenerationException.ErrorType.RATE_LIMIT_EXCEEDED;
            } else if (type.contains("content_policy")) {
                errorType = AIGenerationException.ErrorType.CONTENT_POLICY_VIOLATION;
            } else {
                errorType = AIGenerationException.ErrorType.UNKNOWN_ERROR;
            }
        } catch (Exception parseEx) {
            message = "HTTP " + e.getStatusCode().value() + ": " + e.getStatusText();
            errorType = AIGenerationException.ErrorType.UNKNOWN_ERROR;
        }

        return new AIGenerationException(message, getServiceName(), errorType, e);
    }

    private byte[] downloadImage(String imageUrl) throws Exception {
        URL url = new URL(imageUrl);
        try (InputStream in = url.openStream();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }

            byte[] imageBytes = out.toByteArray();
            logger.info("Downloaded image: {} bytes", imageBytes.length);
            return imageBytes;
        }
    }

    public boolean isAvailable() {
        boolean available = apiKey != null
                         && !apiKey.isEmpty()
                         && !apiKey.equals("your-api-key-here")
                         && !apiKey.equals("sk-your-key-here");

        if (available) {
            logger.debug("OpenAI service is available with API key: {}...",
                        apiKey.substring(0, Math.min(20, apiKey.length())));
        } else {
            logger.debug("OpenAI service is NOT available - no valid API key");
        }

        return available;
    }

    public String getServiceName() {
        return "OpenAI " + model.toUpperCase();
    }

    public Map<String, Integer> getMaxDimensions() {
        Map<String, Integer> dimensions = new HashMap<>();
        if (model.contains("dall-e-3")) {
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

        if (model.contains("dall-e-3")) {
            defaults.put("quality", "standard"); // or "hd"
            defaults.put("style", "vivid"); // or "natural"
        }

        return defaults;
    }
}

