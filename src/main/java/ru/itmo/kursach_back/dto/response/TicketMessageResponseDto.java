package ru.itmo.kursach_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageResponseDto {
    private Integer messageId;
    private Integer ticketId;
    private Integer senderId;
    private String senderUsername;
    private String messageText;
    private Boolean isStaffResponse;
    private LocalDateTime createdAt;
    private Integer attachmentImageId;
}

