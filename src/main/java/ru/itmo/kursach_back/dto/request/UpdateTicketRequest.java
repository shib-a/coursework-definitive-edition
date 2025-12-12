package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.itmo.kursach_back.util.TicketStatus;

@Data
public class UpdateTicketRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private Integer assignedModeratorId;

    private String response;
}

