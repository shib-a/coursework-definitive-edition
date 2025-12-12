package ru.itmo.kursach_back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.request.AddToCartRequestDto;
import ru.itmo.kursach_back.entity.CartItem;
import ru.itmo.kursach_back.service.CartService;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

        @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequestDto request) {
        try {
            CartItem cartItem = cartService.addToCart(request);
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding to cart: " + e.getMessage());
        }
    }

        @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCartItems() {
        try {
            List<CartItem> items = cartService.getCartItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving cart: " + e.getMessage());
        }
    }

        @PutMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Integer cartItemId,
            @RequestParam Integer quantity) {
        try {
            CartItem cartItem = cartService.updateCartItemQuantity(cartItemId, quantity);
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating cart: " + e.getMessage());
        }
    }

        @DeleteMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFromCart(@PathVariable Integer cartItemId) {
        try {
            cartService.removeFromCart(cartItemId);
            return ResponseEntity.ok("Item removed from cart");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing from cart: " + e.getMessage());
        }
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> clearCart() {
        try {
            cartService.clearCart();
            return ResponseEntity.ok("Cart cleared");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error clearing cart: " + e.getMessage());
        }
    }
}

