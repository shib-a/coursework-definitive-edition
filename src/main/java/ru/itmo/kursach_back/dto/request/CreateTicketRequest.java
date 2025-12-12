package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.itmo.kursach_back.util.TicketCategory;
import ru.itmo.kursach_back.util.TicketPriority;

@Data
public class CreateTicketRequest {

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;
}

