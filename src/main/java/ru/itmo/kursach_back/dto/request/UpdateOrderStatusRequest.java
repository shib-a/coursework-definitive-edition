package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.itmo.kursach_back.util.OrderStatus;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    private String note;
}

