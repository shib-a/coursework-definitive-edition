package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "image_datas")
@Data
public class ImageData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "imgd_id")
    Integer imgdId;

    @Size(max = 36)
    @NotNull
    @Column(nullable = false, unique = true)
    String uuid;

    @Column(name = "uploader_id")
    Integer uploaderId;

    @Size(max = 255)
    @Column(name = "title")
    String title;

    @Size(max = 1000)
    @Column(name = "description")
    String description;

    @NotNull
    @Column(name = "is_public", nullable = false)
    Boolean isPublic = false;

    @NotNull
    @Positive
    @Column(nullable = false)
    Integer size;

    @Size(max = 50)
    @NotNull
    @Column(name = "mime_type", nullable = false)
    String mimeType;

    @Size(max = 255)
    @NotNull
    @Column(name = "storage_path", nullable = false)
    String storagePath;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "uploader_id", insertable = false, updatable = false)
    User uploader;
}
