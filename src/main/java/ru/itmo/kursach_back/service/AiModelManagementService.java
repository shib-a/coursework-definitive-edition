package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.entity.AiModel;
import ru.itmo.kursach_back.repository.AiModelRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiModelManagementService {

    private final AiModelRepository aiModelRepository;

        public List<AiModel> getAllModels() {
        return aiModelRepository.findAllByOrderByModelNameAsc();
    }

        public List<AiModel> getActiveModels() {
        return aiModelRepository.findByIsActiveTrue();
    }

        public Optional<AiModel> getModelById(Integer modelId) {
        return aiModelRepository.findById(modelId);
    }

        @Transactional
    public AiModel createModel(AiModel model) {
        return aiModelRepository.save(model);
    }

        @Transactional
    public AiModel updateModel(Integer modelId, AiModel updatedModel) {
        AiModel model = aiModelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("AI Model not found with id: " + modelId));

        if (updatedModel.getModelName() != null) {
            model.setModelName(updatedModel.getModelName());
        }
        if (updatedModel.getApiEndpoint() != null) {
            model.setApiEndpoint(updatedModel.getApiEndpoint());
        }
        if (updatedModel.getIsActive() != null) {
            model.setIsActive(updatedModel.getIsActive());
        }

        return aiModelRepository.save(model);
    }

        @Transactional
    public void deleteModel(Integer modelId) {
        aiModelRepository.deleteById(modelId);
    }

    @Transactional
    public AiModel toggleModelStatus(Integer modelId) {
        AiModel model = aiModelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("AI Model not found with id: " + modelId));

        model.setIsActive(!model.getIsActive());

        return aiModelRepository.save(model);
    }
}

