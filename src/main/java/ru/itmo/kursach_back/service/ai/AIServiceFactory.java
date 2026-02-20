package ru.itmo.kursach_back.service.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AIServiceFactory {

    private final Map<Integer, AIService> serviceMap = new HashMap<>();
    private final AIService defaultService;

    @Autowired
    public AIServiceFactory(List<AIService> aiServices) {
        AIService mockService = null;
        AIService openAIService = null;
        AIService stabilityAIService = null;
        AIService gatewayService = null;

        System.out.println("AIServiceFactory: Initializing with " + aiServices.size() + " services");

        for (AIService service : aiServices) {
            System.out.println("  - Found service: " + service.getClass().getSimpleName() +
                             " (" + service.getServiceName() + "), available: " + service.isAvailable());

            if (service instanceof MockAIService) {
                mockService = service;
            } else if (service.getClass().getSimpleName().contains("LocalAIGateway")) {
                gatewayService = service;
            } else if (service.getClass().getSimpleName().contains("OpenAI")) {
                openAIService = service;
            } else if (service.getClass().getSimpleName().contains("Stability")) {
                stabilityAIService = service;
            }
        }

        if (gatewayService != null && gatewayService.isAvailable()) {
            System.out.println("AIServiceFactory: AI Gateway AVAILABLE, using for all IDs (1-4)");
            serviceMap.put(1, gatewayService);
            serviceMap.put(2, gatewayService);
            serviceMap.put(3, gatewayService);
            serviceMap.put(4, gatewayService);
        } else {

            if (openAIService != null && openAIService.isAvailable()) {
                System.out.println("AIServiceFactory: OpenAI service AVAILABLE, using for IDs 1 & 2");
                serviceMap.put(1, openAIService);
                serviceMap.put(2, openAIService);
            } else if (mockService != null) {
                System.out.println("AIServiceFactory: OpenAI NOT available, using Mock for IDs 1 & 2");
                serviceMap.put(1, mockService);
                serviceMap.put(2, mockService);
            }

            if (stabilityAIService != null && stabilityAIService.isAvailable()) {
                System.out.println("AIServiceFactory: Stability AI AVAILABLE, using for IDs 3 & 4");
                serviceMap.put(3, stabilityAIService);
                serviceMap.put(4, stabilityAIService);
            } else if (mockService != null) {
                System.out.println("AIServiceFactory: Stability AI NOT available, using Mock for IDs 3 & 4");
                serviceMap.put(3, mockService);
                serviceMap.put(4, mockService);
            }
        }

        if (mockService != null) {
            serviceMap.put(999, mockService);
            System.out.println("AIServiceFactory: Mock service mapped to ID 999");
        }

        this.defaultService = gatewayService != null && gatewayService.isAvailable() ? gatewayService :
                              (mockService != null ? mockService :
                              (openAIService != null ? openAIService : aiServices.get(0)));

        System.out.println("AIServiceFactory: Default service: " + defaultService.getServiceName());
    }

    public AIService getService(Integer modelId) {
        AIService service = serviceMap.getOrDefault(modelId, defaultService);
        System.out.println("AIServiceFactory: Requested ID " + modelId +
                         ", selected: " + service.getServiceName() +
                         ", available: " + service.isAvailable());
        return service;
    }

    public AIService getFirstAvailableService() {
        return serviceMap.values().stream()
                .filter(AIService::isAvailable)
                .findFirst()
                .orElse(defaultService);
    }

    public boolean hasRealAIService() {
        return serviceMap.values().stream()
                .anyMatch(s -> s.isAvailable() && !(s instanceof MockAIService));
    }
}

