package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Table(name = "shipping_addresses")
@Data
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    Integer addressId;

    @Column(name = "user_id")
    Integer userId;

    @Column(name = "country_id")
    Integer countryId;

    @Size(max = 100)
    @NotNull
    @Column(nullable = false)
    String city;

    @Size(max = 255)
    @NotNull
    @Column(name = "street_address", nullable = false)
    String streetAddress;

    @Size(max = 20)
    @NotNull
    @Column(name = "postal_code", nullable = false)
    String postalCode;

    @Column(name = "is_default")
    Boolean isDefault;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"addresses", "designs", "images", "orders", "tickets", "favourites", "cartItems"})
    User user;

    @ManyToOne
    @JoinColumn(name = "country_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"addresses", "userProfiles"})
    Country country;

}
