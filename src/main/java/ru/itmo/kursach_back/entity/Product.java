package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Table(name = "products", schema = "\"is\"")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    Integer productId;

    @NotNull
    @Size(max = 100)
    @Column(name = "product_name", nullable = false)
    String productName;

    @NotNull
    @PositiveOrZero
    @Column(name = "base_price", nullable = false)
    Double basePrice;

    @NotNull
    @Size(max = 20)
    @Column(nullable = false)
    String size;

    @NotNull
    @Size(max = 50)
    @Column(nullable = false)
    String color;

    @NotNull
    @Size(max = 100)
    @Column(nullable = false)
    String material;
}
