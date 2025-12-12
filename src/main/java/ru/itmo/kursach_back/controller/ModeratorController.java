package ru.itmo.kursach_back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.request.CreateTicketMessageRequest;
import ru.itmo.kursach_back.dto.request.UpdateOrderStatusRequest;
import ru.itmo.kursach_back.dto.request.UpdateTicketRequest;
import ru.itmo.kursach_back.dto.response.TicketMessageResponseDto;
import ru.itmo.kursach_back.entity.Design;
import ru.itmo.kursach_back.entity.Order;
import ru.itmo.kursach_back.entity.SupportTicket;
import ru.itmo.kursach_back.service.DesignService;
import ru.itmo.kursach_back.service.OrderService;
import ru.itmo.kursach_back.service.TicketMessageService;
import ru.itmo.kursach_back.service.TicketService;
import ru.itmo.kursach_back.util.OrderStatus;
import ru.itmo.kursach_back.util.TicketStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/moderator")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('MODERATOR', 'ADMIN')")
public class ModeratorController {

    private final OrderService orderService;
    private final TicketService ticketService;
    private final TicketMessageService ticketMessageService;
    private final DesignService designService;


    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

        @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer orderId) {
        return orderService.getOrderById(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Integer orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, request.getStatus());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/tickets/status/{status}")
    public ResponseEntity<List<SupportTicket>> getTicketsByStatus(@PathVariable TicketStatus status) {
        return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
    }

    @GetMapping("/tickets/unassigned")
    public ResponseEntity<List<SupportTicket>> getUnassignedTickets() {
        return ResponseEntity.ok(ticketService.getUnassignedTickets());
    }

    @GetMapping("/tickets/my")
    public ResponseEntity<List<SupportTicket>> getMyTickets() {

        return ResponseEntity.ok(ticketService.getAllTickets());
    }

        @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<SupportTicket> getTicketById(@PathVariable Integer ticketId) {
        return ticketService.getTicketById(ticketId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<SupportTicket> assignTicket(
            @PathVariable Integer ticketId,
            @RequestBody Map<String, Integer> body) {
        try {
            Integer moderatorId = body.get("moderatorId");
            SupportTicket ticket = ticketService.assignTicket(ticketId, moderatorId);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

        @PutMapping("/tickets/{ticketId}/status")
    public ResponseEntity<SupportTicket> updateTicketStatus(
            @PathVariable Integer ticketId,
            @Valid @RequestBody UpdateTicketRequest request) {
        try {
            SupportTicket ticket = ticketService.updateTicketStatus(ticketId, request.getStatus());

            if (request.getAssignedModeratorId() != null) {
                ticket = ticketService.assignTicket(ticketId, request.getAssignedModeratorId());
            }

            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

        @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<List<TicketMessageResponseDto>> getTicketMessages(@PathVariable Integer ticketId) {
        try {
            List<TicketMessageResponseDto> messages = ticketMessageService.getMessagesForTicket(ticketId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

        @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<TicketMessageResponseDto> addTicketMessage(
            @PathVariable Integer ticketId,
            @Valid @RequestBody CreateTicketMessageRequest request) {
        try {

            request.setTicketId(ticketId);

            TicketMessageResponseDto message = ticketMessageService.createMessage(
                    ticketId,
                    request.getMessageText(),
                    request.getAttachmentImageId(),
                    true  // isStaffResponse = true for moderators
            );
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/designs")
    public ResponseEntity<List<Design>> getAllDesigns() {
        return ResponseEntity.ok(designService.getAllDesignsForModerator());
    }

        @GetMapping("/designs/{designId}")
    public ResponseEntity<Design> getDesignById(@PathVariable Integer designId) {
        return designService.findDesignById(designId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        @PutMapping("/designs/{designId}/visibility")
    public ResponseEntity<Design> updateDesignVisibility(
            @PathVariable Integer designId,
            @RequestBody Map<String, Boolean> body) {
        try {
            Boolean isPublic = body.get("isPublic");
            Design design = designService.updateDesignVisibilityByModerator(designId, isPublic);
            return ResponseEntity.ok(design);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

        @DeleteMapping("/designs/{designId}")
    public ResponseEntity<Map<String, String>> deleteDesign(@PathVariable Integer designId) {
        try {
            Design design = designService.findDesignById(designId)
                    .orElseThrow(() -> new RuntimeException("Design not found"));
            designService.deleteDesign(design.getDesignId());
            return ResponseEntity.ok(Map.of("message", "Design deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

