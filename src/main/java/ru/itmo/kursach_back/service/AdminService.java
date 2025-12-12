package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.response.StatisticsResponse;
import ru.itmo.kursach_back.entity.Design;
import ru.itmo.kursach_back.repository.*;
import ru.itmo.kursach_back.util.OrderStatus;
import ru.itmo.kursach_back.util.TicketStatus;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final DesignRepository designRepository;
    private final SupportTicketRepository supportTicketRepository;

        public StatisticsResponse getStatistics() {
        StatisticsResponse stats = new StatisticsResponse();

        stats.setTotalUsers(userRepository.count());

        stats.setTotalOrders(orderRepository.count());
        stats.setPendingOrders(orderRepository.countByStatus(OrderStatus.PENDING));
        stats.setProcessingOrders(orderRepository.countByStatus(OrderStatus.PROCESSING));
        stats.setCompletedOrders(orderRepository.countByStatus(OrderStatus.DELIVERED));

        stats.setTotalDesigns(designRepository.count());
        stats.setPublicDesigns(designRepository.countByIsPublic(true));
        stats.setPrivateDesigns(designRepository.countByIsPublic(false));

        stats.setTotalTickets(supportTicketRepository.count());
        stats.setOpenTickets(supportTicketRepository.countByStatus(TicketStatus.OPEN));
        stats.setInProgressTickets(supportTicketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.setClosedTickets(supportTicketRepository.countByStatus(TicketStatus.CLOSED));

        Double totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);

        Double pendingRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.PENDING);
        stats.setPendingRevenue(pendingRevenue != null ? pendingRevenue : 0.0);

        return stats;
    }
}

