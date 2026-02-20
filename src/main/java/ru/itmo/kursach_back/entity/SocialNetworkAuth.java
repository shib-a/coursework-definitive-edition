package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.itmo.kursach_back.util.AuthSocialNetworkType;

@Entity
@Table(name = "social_network_auths")
@Data
public class SocialNetworkAuth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sna_id")
    private Integer snaId;

    @Column(name = "account_id")
    private Integer accountId;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "social_network_type", nullable = false)
    private AuthSocialNetworkType socialNetworkType;

    @NotNull
    @Size(max = 255)
    @Column(name = "auth_token", nullable = false)
    private String authToken;

    @ManyToOne
    @JoinColumn(name = "account_id", insertable = false, updatable = false)
    private Account account;
}

