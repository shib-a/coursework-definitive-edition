package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.entity.SupportTicket;
import ru.itmo.kursach_back.repository.SupportTicketRepository;
import ru.itmo.kursach_back.util.TicketCategory;
import ru.itmo.kursach_back.util.TicketPriority;
import ru.itmo.kursach_back.util.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final SupportTicketRepository supportTicketRepository;

        public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc();
    }

        public List<SupportTicket> getTicketsByStatus(TicketStatus status) {
        return supportTicketRepository.findByStatusOrderByPriorityDescCreatedAtAsc(status);
    }

        public Optional<SupportTicket> getTicketById(Integer ticketId) {
        return supportTicketRepository.findById(ticketId);
    }

        public List<SupportTicket> getUnassignedTickets() {
        return supportTicketRepository.findUnassignedTickets();
    }

        public List<SupportTicket> getTicketsByModerator(Integer moderatorId) {
        return supportTicketRepository.findByAssignedModeratorId(moderatorId);
    }

    @Transactional
    public SupportTicket assignTicket(Integer ticketId, Integer moderatorId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setAssignedModeratorId(moderatorId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());

        return supportTicketRepository.save(ticket);
    }

        @Transactional
    public SupportTicket updateTicketStatus(Integer ticketId, TicketStatus newStatus) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        return supportTicketRepository.save(ticket);
    }

        public List<SupportTicket> getTicketsByUserId(Integer userId) {
        return supportTicketRepository.findByUserId(userId);
    }

    public Long countTicketsByStatus(TicketStatus status) {
        return supportTicketRepository.countByStatus(status);
    }

        public List<SupportTicket> getTicketsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return supportTicketRepository.findByDateRange(startDate, endDate);
    }

        @Transactional
    public SupportTicket createTicket(Integer userId, TicketCategory category, String description, TicketPriority priority) {
        SupportTicket ticket = new SupportTicket();
        ticket.setUserId(userId);
        ticket.setCategory(category);
        ticket.setDescription(description);
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());

        String ticketNumber = "TKT-" + System.currentTimeMillis();
        ticket.setTicketNumber(ticketNumber);

        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public void updateTicketTimestamp(Integer ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setUpdatedAt(LocalDateTime.now());
        supportTicketRepository.save(ticket);
    }
}

