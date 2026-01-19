package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.request.AddToCartRequestDto;
import ru.itmo.kursach_back.entity.CartItem;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.CartItemRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final AuthService authService;

        @Transactional
    public CartItem addToCart(AddToCartRequestDto request) {
        User currentUser = authService.getCurrentUser();

        productService.validateProductExists(request.getProductId());

        Optional<CartItem> existingItem = cartItemRepository
                .findByUserIdAndProductId(currentUser.getUserId(), request.getProductId());

        if (existingItem.isPresent()) {

            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            return cartItemRepository.save(cartItem);
        } else {

            CartItem cartItem = new CartItem();
            cartItem.setUserId(currentUser.getUserId());
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setSize(request.getSize());
            cartItem.setColor(request.getColor());
            cartItem.setPrice(request.getPrice());
            cartItem.setDesignId(request.getDesignId());
            cartItem.setAddedAt(LocalDateTime.now());
            return cartItemRepository.save(cartItem);
        }
    }

        public List<CartItem> getCartItems() {
        User currentUser = authService.getCurrentUser();
        return cartItemRepository.findByUserId(currentUser.getUserId());
    }

        @Transactional
    public CartItem updateCartItemQuantity(Integer cartItemId, Integer quantity) {
        User currentUser = authService.getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied");
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

        @Transactional
    public void removeFromCart(Integer cartItemId) {
        User currentUser = authService.getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart() {
        User currentUser = authService.getCurrentUser();
        cartItemRepository.deleteByUserId(currentUser.getUserId());
    }

    public BigDecimal getCartTotal() {
        User currentUser = authService.getCurrentUser();
        return cartItemRepository.calculateCartTotal(currentUser.getUserId());
    }
}

