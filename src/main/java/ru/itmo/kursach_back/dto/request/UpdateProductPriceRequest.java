package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateProductPriceRequest {

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;
}

