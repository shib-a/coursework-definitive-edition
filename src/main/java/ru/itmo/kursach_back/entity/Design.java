package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "designs")
@Data
public class Design {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_id")
    Integer designId;

    @Column(name = "owner_id")
    Integer ownerId;

    @NotBlank
    @NotNull
    @Size(max = 255)
    @Column(name = "design_name")
    String title = "New Design";

    @Column(name = "original_prompt", columnDefinition = "TEXT")
    String originalPrompt;

    @Column(name = "theme_id")
    Integer themeId;

    @Column(name = "model_id")
    Integer modelId;

    @Column(name = "image_id")
    Integer imageId;

    @NotNull
    @Column(name = "is_ai_generated", nullable = false)
    Boolean isAiGenerated = true;

    @NotNull
    @Column(name = "is_public", nullable = false)
    Boolean isPublic = false;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @NotNull
    @Column(name = "modified_at", nullable = false)
    LocalDateTime modifiedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems"})
    User owner;

    @ManyToOne
    @JoinColumn(name = "theme_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"designs", "generationRequests"})
    GenerationTheme generationTheme;

    @ManyToOne
    @JoinColumn(name = "model_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"designs", "generationRequests"})
    AiModel aiModel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"uploader"})
    ImageData imageData;

    @OneToMany(mappedBy = "design")
    @JsonIgnore
    List<UserFavourite> userFavourites;

    @OneToMany(mappedBy = "design")
    @JsonIgnore
    List<OrderItem> orderItems;

    @OneToMany(mappedBy = "design")
    @JsonIgnore
    List<CartItem> cartItems;
}
