package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.CartItem;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByUserId(Integer userId);
    Optional<CartItem> findByUserIdAndProductId(Integer userId, Integer productId);
    void deleteByUserId(Integer userId);

    @Query(value = "SELECT is.calculate_cart_total(:userId)", nativeQuery = true)
    BigDecimal calculateCartTotal(@Param("userId") Integer userId);
}

