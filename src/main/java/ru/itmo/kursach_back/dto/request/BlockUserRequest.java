package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlockUserRequest {

    @NotNull(message = "Blocked status is required")
    private Boolean blocked;

    private String reason;
}

