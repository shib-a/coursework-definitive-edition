package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must be less than 100 characters")
    private String productName;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double basePrice;

    @NotBlank(message = "Size is required")
    @Size(max = 20, message = "Size must be less than 20 characters")
    private String size;

    @NotBlank(message = "Color is required")
    @Size(max = 50, message = "Color must be less than 50 characters")
    private String color;

    @NotBlank(message = "Material is required")
    @Size(max = 100, message = "Material must be less than 100 characters")
    private String material;
}

