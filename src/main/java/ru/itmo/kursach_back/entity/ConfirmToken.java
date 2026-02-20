package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.itmo.kursach_back.util.AuthTokenType;

import java.time.LocalDateTime;

@Entity
@Table(name = "confirm_tokens")
@Data
public class ConfirmToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ct_id")
    private Integer ctId;

    @NotNull
    @Size(max = 255)
    @Column(name = "token_val", nullable = false, unique = true)
    private String tokenVal;

    @NotNull
    @Column(name = "till_date", nullable = false)
    private LocalDateTime tillDate;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "token_type", nullable = false)
    private AuthTokenType tokenType;

    @Column(name = "token_body", columnDefinition = "TEXT")
    private String tokenBody;
}

