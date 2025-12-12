package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "countries")
@Data
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "country_id")
    Integer countryId;

    @Size(max = 100)
    @NotBlank
    @Column(name = "country_name", unique = true)
    String countryName;

    @Size(max = 3)
    @Column(name = "country_code", unique = true)
    String countryCode;

    @Size(max = 50)
    String timezone;

    @OneToMany(mappedBy = "country")
    @JsonIgnore
    List<UserProfile> userProfiles;

    @OneToMany(mappedBy = "country")
    @JsonIgnore
    List<Address> addresses;
}
