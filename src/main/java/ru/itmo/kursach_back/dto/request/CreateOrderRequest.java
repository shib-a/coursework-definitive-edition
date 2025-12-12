package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull(message = "Shipping address ID is required")
    private Integer shippingAddressId;

    @NotNull(message = "Shipping cost is required")
    @Positive(message = "Shipping cost must be positive")
    private Double shippingCost;

    private String notes;
}

