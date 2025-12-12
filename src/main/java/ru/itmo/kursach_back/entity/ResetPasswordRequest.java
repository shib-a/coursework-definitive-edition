package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "reset_password_requests")
@Data
public class ResetPasswordRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rpr_id")
    private Integer rprId;

    @Column(name = "user_id")
    private Integer userId;

    @NotNull
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate = LocalDateTime.now();

    @Column(name = "token_id")
    private Integer tokenId;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "token_id", insertable = false, updatable = false)
    private ConfirmToken confirmToken;
}

