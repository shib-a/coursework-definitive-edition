package ru.itmo.kursach_back.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="ticket_ratings", schema = "\"is\"")
@Data
public class TicketRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    Integer ratingId;

    @Column(name = "ticket_id", unique = true)
    Integer ticketId;

    @Column(name = "user_id", unique = true)
    Integer userId;

    @Max(5)
    @Min(1)
    @Column(name = "rating_value")
    Integer ratingValue;

    @Column(columnDefinition = "TEXT")
    String comment;

    @NotNull
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne
    @JoinColumn(name = "ticket_id", insertable = false, updatable = false)
    SupportTicket ticket;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;
}
