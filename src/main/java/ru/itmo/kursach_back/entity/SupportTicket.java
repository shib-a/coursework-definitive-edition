package ru.itmo.kursach_back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.itmo.kursach_back.util.TicketCategory;
import ru.itmo.kursach_back.util.TicketPriority;
import ru.itmo.kursach_back.util.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "support_tickets")
@Data
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    Integer ticketId;

    @Column(name = "user_id")
    Integer userId;

    @Column(name = "assigned_moderator_id")
    Integer assignedModeratorId;

    @Size(max = 50)
    @NotNull
    @Column(name = "ticket_number", nullable = false, unique = true)
    String ticketNumber;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    TicketCategory category;

    @NotNull
    @Column(columnDefinition = "TEXT", nullable = false)
    String description;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    TicketStatus status;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    TicketPriority priority;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "closed_at")
    LocalDateTime closedAt;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems"})
    User user;

    @ManyToOne
    @JoinColumn(name = "assigned_moderator_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "addresses", "designs", "images", "tickets", "favourites", "cartItems"})
    User assignedModerator;

    @OneToOne(mappedBy = "ticket")
    @JsonIgnore
    TicketRating rating;

    @OneToMany(mappedBy = "supportTicket")
    @JsonIgnoreProperties({"supportTicket"})
    List<TicketMessage> messages;
}
