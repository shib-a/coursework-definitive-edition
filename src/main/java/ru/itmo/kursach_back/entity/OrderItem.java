package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    Integer orderItemId;

    @Column(name = "order_id")
    Integer orderId;

    @Column(name = "design_id")
    Integer designId;

    @Column(name = "product_id")
    Integer productId;

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
    @PositiveOrZero
    @Column(name = "unit_price", nullable = false)
    Double unitPrice;

    @NotNull
    @Column(nullable = false)
    Double subtotal;

    @Column(columnDefinition = "TEXT")
    String customization;

    @Column(name = "print_file_id")
    Integer printFileId;

    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    @JsonIgnore
    Order order;

    @ManyToOne
    @JoinColumn(name = "design_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"owner", "image", "orderItems"})
    Design design;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"category", "orderItems", "cartItems"})
    Product product;

    @ManyToOne
    @JoinColumn(name = "print_file_id", insertable = false, updatable = false)
    ImageData printFile;
}
