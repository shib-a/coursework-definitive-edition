package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Data
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    Integer cartItemId;

    @Column(name = "user_id")
    Integer userId;

    @Column(name = "product_id")
    Integer productId;

    @Column(name = "design_id")
    Integer designId;

    @NotNull
    @Size(max = 20)
    @Column(nullable = false)
    String size;

    @NotNull
    @Size(max = 50)
    @Column(nullable = false)
    String color;

    @Positive
    @NotNull
    @Column(nullable = false)
    Integer quantity;

    @NotNull
    @Column(name = "added_at", nullable = false)
    LocalDateTime addedAt = LocalDateTime.now();

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    Double price;

    @Column(columnDefinition = "TEXT")
    String customization;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems", "account", "profile"})
    User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "design_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"owner", "userFavourites", "orderItems", "cartItems"})
    Design design;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    Product product;
}
