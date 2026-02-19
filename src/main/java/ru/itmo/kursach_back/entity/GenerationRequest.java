package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.itmo.kursach_back.util.GenerationStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "generation_requests", schema = "\"is\"")
@Data
public class GenerationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    Integer requestId;

    @Column(name = "user_id")
    Integer userId;

    @Column(name = "model_id")
    Integer modelId;

    @NotNull
    @Column(columnDefinition = "TEXT", nullable = false)
    String prompt;

    @Column(name = "theme_id")
    Integer themeId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    GenerationStatus status;

    @Column(name = "result_design_id")
    Integer resultDesignId;

    @NotNull
    @Column(columnDefinition = "TEXT", nullable = false)
    String parameters;

    @NotNull
    @Column(name = "requested_at", nullable = false)
    LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "model_id", insertable = false, updatable = false)
    AiModel aiModel;

    @ManyToOne
    @JoinColumn(name = "theme_id", insertable = false, updatable = false)
    GenerationTheme generationTheme;

    @ManyToOne
    @JoinColumn(name = "result_design_id", insertable = false, updatable = false)
    Design resultDesign;
}
