package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.entity.Order;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.OrderRepository;
import ru.itmo.kursach_back.util.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final AddressService addressService;
    private final AuthService authService;

        public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

        public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

        public Optional<Order> getOrderById(Integer orderId) {
        return orderRepository.findById(orderId);
    }

        public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

        @Transactional
    public Order updateOrderStatus(Integer orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }

        public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

        public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByDateRange(startDate, endDate);
    }

    public Long countOrdersByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }

        public Double calculateTotalRevenueByStatus(OrderStatus status) {
        Double total = orderRepository.sumTotalAmountByStatus(status);
        return total != null ? total : 0.0;
    }

        @Transactional
    public Order createOrder(Integer shippingAddressId, Double shippingCost) {
        User currentUser = authService.getCurrentUser();

        // Validate address belongs to current user
        addressService.getAddressById(shippingAddressId)
                .orElseThrow(() -> new RuntimeException("Invalid shipping address"));

        Integer orderId = orderRepository.checkoutCart(
                currentUser.getUserId(),
                shippingAddressId,
                shippingCost
        );

        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order creation failed"));
    }
}

