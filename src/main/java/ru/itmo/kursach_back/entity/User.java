package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.itmo.kursach_back.util.AuthAuthority;

import java.time.LocalDate;

@Entity
@Table(name = "users", schema = "\"is\"")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Size(max = 100)
    @Column(unique = true)
    private String username;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private AuthAuthority authority = AuthAuthority.USER;

    @NotNull
    @Column(name = "registered_date", nullable = false)
    private LocalDate registeredDate = LocalDate.now();

    @Column(name = "is_blocked", nullable = false)
    private Boolean blocked = false;
}

