package ru.itmo.kursach_back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketMessageRequest {

    @NotNull(message = "Ticket ID is required")
    private Integer ticketId;

    @NotBlank(message = "Message text is required")
    private String messageText;

    private Integer attachmentImageId;
}

