package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.itmo.kursach_back.util.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders", schema = "\"is\"")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    Integer orderId;

    @Column(name = "user_id")
    Integer userId;

    @NotNull
    @Size(max = 50)
    @Column(name = "order_number", nullable = false, unique = true)
    String orderNumber;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    OrderStatus status;

    @NotNull
    @PositiveOrZero
    @Column(name = "total_amount", nullable = false)
    Double totalAmount;

    @Column(name = "shipping_address_id")
    Integer shippingAddressId;

    @NotNull
    @PositiveOrZero
    @Column(name = "shipping_cost", nullable = false)
    Double shippingCost;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems"})
    User user;

    @OneToMany(mappedBy = "order")
    @JsonIgnoreProperties({"order"})
    List<OrderItem> orderItems;

    @ManyToOne
    @JoinColumn(name = "shipping_address_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"user", "addresses"})
    Address shippingAddress;
}
