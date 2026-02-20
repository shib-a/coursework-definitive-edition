package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="image_links")
@Data
public class ImageLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "imgl_id")
    Integer imglId;

    @Column(name = "imgd_id")
    Integer imgdId;

    @Size(max = 255)
    @NotNull
    @NotBlank
    @Column(name = "url_path", nullable = false)
    String urlPath;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

    @Size(max = 255)
    @NotNull
    @Column(name = "access_token", nullable = false)
    String accessToken;

    @ManyToOne
    @JoinColumn(name = "imgd_id", insertable = false, updatable = false)
    ImageData imageData;
}
