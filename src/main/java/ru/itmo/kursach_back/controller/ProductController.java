package ru.itmo.kursach_back.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.response.ProductGroupResponseDto;
import ru.itmo.kursach_back.dto.response.ProductResponseDto;
import ru.itmo.kursach_back.service.ProductService;

import java.util.List;

@RestController
@RequestMapping(value = "/api/products", produces = "application/json;charset=UTF-8")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

        @GetMapping("/grouped")
    public ResponseEntity<?> getGroupedProducts() {
        try {
            List<ProductGroupResponseDto> products = productService.getGroupedProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving grouped products: " + e.getMessage());
        }
    }

        @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductResponseDto> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving products: " + e.getMessage());
        }
    }

        @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Integer productId) {
        try {
            ProductResponseDto product = productService.getProductById(productId);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving product: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String query) {
        try {
            List<ProductResponseDto> products = productService.searchProducts(query);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching products: " + e.getMessage());
        }
    }
}
