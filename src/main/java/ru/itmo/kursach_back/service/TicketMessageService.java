package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.response.TicketMessageResponseDto;
import ru.itmo.kursach_back.entity.TicketMessage;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.TicketMessageRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketMessageService {

    private final TicketMessageRepository ticketMessageRepository;
    private final TicketService ticketService;
    private final AuthService authService;

        public List<TicketMessageResponseDto> getMessagesForTicket(Integer ticketId) {
        List<TicketMessage> messages = ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

        @Transactional
    public TicketMessageResponseDto createMessage(Integer ticketId, String messageText, Integer attachmentImageId, boolean isStaffResponse) {
        User currentUser = authService.getCurrentUser();

        ticketService.getTicketById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketMessage message = new TicketMessage();
        message.setTicketId(ticketId);
        message.setSenderId(currentUser.getUserId());
        message.setMessageText(messageText);
        message.setIsStaffResponse(isStaffResponse);
        message.setCreatedAt(LocalDateTime.now());
        message.setAttachmentImageId(attachmentImageId);

        TicketMessage savedMessage = ticketMessageRepository.save(message);

        ticketService.updateTicketTimestamp(ticketId);

        return convertToDto(savedMessage);
    }

        public Long getMessageCount(Integer ticketId) {
        return ticketMessageRepository.countByTicketId(ticketId);
    }

    private TicketMessageResponseDto convertToDto(TicketMessage message) {
        TicketMessageResponseDto dto = new TicketMessageResponseDto();
        dto.setMessageId(message.getMessageId());
        dto.setTicketId(message.getTicketId());
        dto.setSenderId(message.getSenderId());
        dto.setMessageText(message.getMessageText());
        dto.setIsStaffResponse(message.getIsStaffResponse());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setAttachmentImageId(message.getAttachmentImageId());

        if (message.getSender() != null) {
            dto.setSenderUsername(message.getSender().getUsername());
        }

        return dto;
    }
}

