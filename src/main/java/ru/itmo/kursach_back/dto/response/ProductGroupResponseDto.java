package ru.itmo.kursach_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductGroupResponseDto {
    private String productName;
    private Double basePrice;
    private String material;
    private Set<String> availableSizes;
    private Set<String> availableColors;
    private List<ProductVariant> variants;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductVariant {
        private Integer productId;
        private String size;
        private String color;
        private Double basePrice;
    }
}

