package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "ai_models", schema = "\"is\"")
@Data
public class AiModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    Integer modelId;

    @Size(max = 100)
    @NotBlank
    @NotNull
    @Column(name = "model_name", nullable = false, unique = true)
    String modelName;

    @Size(max = 255)
    @NotNull
    @Column(name = "api_endpoint", nullable = false, unique = true)
    String apiEndpoint;

    @NotNull
    @Column(name = "is_active", nullable = false)
    Boolean isActive;

    @OneToMany(mappedBy = "aiModel")
    @JsonIgnore
    List<GenerationRequest> generationRequests;

    @OneToMany(mappedBy = "aiModel")
    @JsonIgnore
    List<Design> designs;
}
