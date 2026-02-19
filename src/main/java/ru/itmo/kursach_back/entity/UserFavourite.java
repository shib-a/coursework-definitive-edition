package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="user_favorites", schema = "\"is\"")
@Data
public class UserFavourite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favourite_id")
    Integer favouriteId;

    @Column(name = "user_id")
    Integer userId;

    @Column(name = "design_id")
    Integer designId;

    @NotNull
    @Column(name = "added_at")
    LocalDateTime addedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "design_id", insertable = false, updatable = false)
    Design design;
}
