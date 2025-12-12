package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="ticket_messages")
@Data
public class TicketMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    Integer messageId;

    @Column(name = "ticket_id")
    Integer ticketId;

    @Column(name = "sender_id")
    Integer senderId;

    @NotNull
    @NotBlank
    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    String messageText;

    @NotNull
    @Column(name = "is_staff_response", nullable = false)
    Boolean isStaffResponse;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "attachment_image_id")
    Integer attachmentImageId;

    @ManyToOne
    @JoinColumn(name = "ticket_id", insertable = false, updatable = false)
    @JsonIgnore
    SupportTicket supportTicket;

    @ManyToOne
    @JoinColumn(name = "sender_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems"})
    User sender;

    @ManyToOne
    @JoinColumn(name = "attachment_image_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"user", "design"})
    ImageData attachmentImage;
}
