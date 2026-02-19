package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "generation_themes", schema = "\"is\"")
@Data
public class GenerationTheme {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "theme_id")
    Integer themeId;

    @Size(max = 100)
    @NotNull
    @Column(name = "theme_name", nullable = false)
    String themeName;

    @NotNull
    @Column(name = "theme_prompt_template", columnDefinition = "TEXT", nullable = false)
    String themePromptTemplate;

    @Column(name = "preview_image_id")
    Integer previewImageId;

    @NotNull
    @Column(name = "is_active", nullable = false)
    Boolean isActive;

    @Column(name = "created_by")
    Integer createdBy;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "preview_image_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"user", "design"})
    ImageData previewImage;

    @ManyToOne
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems"})
    User creator;

    @OneToMany(mappedBy = "generationTheme")
    @JsonIgnore
    List<GenerationRequest> requests;

    @OneToMany(mappedBy = "generationTheme")
    @JsonIgnore
    List<Design> designs;
}
