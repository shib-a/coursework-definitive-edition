package ru.itmo.kursach_back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.request.CreateTicketMessageRequest;
import ru.itmo.kursach_back.dto.request.CreateTicketRequest;
import ru.itmo.kursach_back.dto.response.TicketMessageResponseDto;
import ru.itmo.kursach_back.entity.SupportTicket;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.service.AuthService;
import ru.itmo.kursach_back.service.TicketMessageService;
import ru.itmo.kursach_back.service.TicketService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final TicketMessageService ticketMessageService;
    private final AuthService authService;

        @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        try {
            User currentUser = authService.getCurrentUser();
            SupportTicket ticket = ticketService.createTicket(
                    currentUser.getUserId(),
                    request.getCategory(),
                    request.getDescription(),
                    request.getPriority()
            );
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating ticket: " + e.getMessage()));
        }
    }

        @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyTickets() {
        try {
            User currentUser = authService.getCurrentUser();
            List<SupportTicket> tickets = ticketService.getTicketsByUserId(currentUser.getUserId());
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving tickets: " + e.getMessage()));
        }
    }

        @GetMapping("/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTicketById(@PathVariable Integer ticketId) {
        try {
            User currentUser = authService.getCurrentUser();
            SupportTicket ticket = ticketService.getTicketById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));

            if (!ticket.getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving ticket: " + e.getMessage()));
        }
    }

        @GetMapping("/{ticketId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTicketMessages(@PathVariable Integer ticketId) {
        try {
            User currentUser = authService.getCurrentUser();
            SupportTicket ticket = ticketService.getTicketById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));

            if (!ticket.getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            List<TicketMessageResponseDto> messages = ticketMessageService.getMessagesForTicket(ticketId);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving messages: " + e.getMessage()));
        }
    }

        @PostMapping("/{ticketId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addTicketMessage(
            @PathVariable Integer ticketId,
            @Valid @RequestBody CreateTicketMessageRequest request) {
        try {
            User currentUser = authService.getCurrentUser();
            SupportTicket ticket = ticketService.getTicketById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));

            if (!ticket.getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            request.setTicketId(ticketId);

            TicketMessageResponseDto message = ticketMessageService.createMessage(
                    ticketId,
                    request.getMessageText(),
                    request.getAttachmentImageId(),
                    false  // isStaffResponse = false for users
            );
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating message: " + e.getMessage()));
        }
    }
}
