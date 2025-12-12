package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="user_profiles")
@Data
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "up_id")
    Integer upId;

    @Column(name = "user_id")
    Integer userId;

    @Size(min = 1, max = 255)
    @NotBlank
    @NotNull
    @Column(nullable = false, unique = true)
    String email;

    @Column(name = "birth_date")
    LocalDate birthDate;

    @Column(name = "country_id")
    Integer countryId;

    @Size(min = 2, max = 100)
    @NotBlank
    @NotNull
    @Column(name = "first_name", nullable = false)
    String firstName;

    @Size(min = 1, max = 100)
    @NotBlank
    @NotNull
    @Column(name = "last_name", nullable = false)
    String lastName;

    @Size(min = 1, max = 20)
    String phone;

    @PositiveOrZero
    @NotNull
    @Column(name = "generation_quota_used", nullable = false)
    Integer generationQuotaUsed = 0;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "country_id", insertable = false, updatable = false)
    Country country;
}
