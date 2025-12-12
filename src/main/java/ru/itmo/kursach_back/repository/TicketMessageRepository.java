package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.TicketMessage;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Integer> {

    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Integer ticketId);

    List<TicketMessage> findBySenderId(Integer senderId);

    List<TicketMessage> findByTicketIdAndIsStaffResponseTrue(Integer ticketId);

    Long countByTicketId(Integer ticketId);
}

