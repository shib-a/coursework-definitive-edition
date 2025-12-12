package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.SupportTicket;
import ru.itmo.kursach_back.util.TicketStatus;
import ru.itmo.kursach_back.util.TicketPriority;
import ru.itmo.kursach_back.util.TicketCategory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {

    List<SupportTicket> findByUserId(Integer userId);

    List<SupportTicket> findByAssignedModeratorId(Integer moderatorId);

    List<SupportTicket> findByStatus(TicketStatus status);

    List<SupportTicket> findByPriority(TicketPriority priority);

    List<SupportTicket> findByCategory(TicketCategory category);

    Optional<SupportTicket> findByTicketNumber(String ticketNumber);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    List<SupportTicket> findByStatusOrderByPriorityDescCreatedAtAsc(TicketStatus status);

    @Query("SELECT t FROM SupportTicket t WHERE t.assignedModeratorId IS NULL AND t.status = ru.itmo.kursach_back.util.TicketStatus.OPEN ORDER BY t.createdAt DESC")
    List<SupportTicket> findUnassignedTickets();

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status = :status")
    Long countByStatus(@Param("status") TicketStatus status);

    @Query("SELECT t FROM SupportTicket t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<SupportTicket> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

