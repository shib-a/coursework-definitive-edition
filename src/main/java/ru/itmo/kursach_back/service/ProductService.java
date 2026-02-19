package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.response.ProductGroupResponseDto;
import ru.itmo.kursach_back.dto.response.ProductResponseDto;
import ru.itmo.kursach_back.entity.Product;
import ru.itmo.kursach_back.repository.ProductRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProductsRaw() {
        return productRepository.findAll();
    }

        public List<ProductGroupResponseDto> getGroupedProducts() {
        List<Product> products = productRepository.findAll();

        Map<String, List<Product>> grouped = products.stream()
                .collect(Collectors.groupingBy(Product::getProductName));

        return grouped.entrySet().stream().map(entry -> {
            String productName = entry.getKey();
            List<Product> variants = entry.getValue();

            ProductGroupResponseDto dto = new ProductGroupResponseDto();
            dto.setProductName(productName);
            dto.setMaterial(variants.get(0).getMaterial());
            dto.setBasePrice(variants.stream().mapToDouble(Product::getBasePrice).min().orElse(0.0));

            dto.setAvailableSizes(variants.stream()
                    .map(Product::getSize)
                    .collect(Collectors.toCollection(TreeSet::new)));

            dto.setAvailableColors(variants.stream()
                    .map(Product::getColor)
                    .collect(Collectors.toCollection(LinkedHashSet::new)));

            dto.setVariants(variants.stream()
                    .map(p -> new ProductGroupResponseDto.ProductVariant(
                            p.getProductId(),
                            p.getSize(),
                            p.getColor(),
                            p.getBasePrice()
                    ))
                    .collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

        public List<ProductResponseDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::convertToDto).collect(Collectors.toList());
    }

        public ProductResponseDto getProductById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDto(product);
    }

    public List<ProductResponseDto> searchProducts(String query) {
        List<Product> products = productRepository.findByProductNameContainingIgnoreCase(query);
        return products.stream().map(this::convertToDto).collect(Collectors.toList());
    }

        public void validateProductExists(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
    }

        @Transactional
    public Product updateProductPrice(Integer productId, Double newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        product.setBasePrice(newPrice);
        return productRepository.save(product);
    }

    @Transactional
    public Product createProduct(String productName, Double basePrice, String size, String color, String material) {
        Product product = new Product();
        product.setProductName(productName);
        product.setBasePrice(basePrice);
        product.setSize(size);
        product.setColor(color);
        product.setMaterial(material);
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Integer productId, String productName, Double basePrice, String size, String color, String material) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        product.setProductName(productName);
        product.setBasePrice(basePrice);
        product.setSize(size);
        product.setColor(color);
        product.setMaterial(material);
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
        productRepository.deleteById(productId);
    }

    private ProductResponseDto convertToDto(Product product) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setBasePrice(product.getBasePrice());
        dto.setSize(product.getSize());
        dto.setColor(product.getColor());
        dto.setMaterial(product.getMaterial());
        return dto;
    }
}
