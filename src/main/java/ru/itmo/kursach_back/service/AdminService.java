package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.itmo.kursach_back.dto.response.StatisticsResponse;
import ru.itmo.kursach_back.util.OrderStatus;
import ru.itmo.kursach_back.util.TicketStatus;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserManagementService userManagementService;
    private final OrderService orderService;
    private final DesignService designService;
    private final TicketService ticketService;

        public StatisticsResponse getStatistics() {
        StatisticsResponse stats = new StatisticsResponse();

        stats.setTotalUsers(userManagementService.getTotalUsersCount());

        stats.setTotalOrders((long) orderService.getAllOrders().size());
        stats.setPendingOrders(orderService.countOrdersByStatus(OrderStatus.PENDING));
        stats.setProcessingOrders(orderService.countOrdersByStatus(OrderStatus.PROCESSING));
        stats.setCompletedOrders(orderService.countOrdersByStatus(OrderStatus.DELIVERED));

        stats.setTotalDesigns((long) designService.getAllDesignsForModerator().size());
        stats.setPublicDesigns((long) designService.getPublicDesigns().size());
        stats.setPrivateDesigns(stats.getTotalDesigns() - stats.getPublicDesigns());

        stats.setTotalTickets((long) ticketService.getAllTickets().size());
        stats.setOpenTickets(ticketService.countTicketsByStatus(TicketStatus.OPEN));
        stats.setInProgressTickets(ticketService.countTicketsByStatus(TicketStatus.IN_PROGRESS));
        stats.setClosedTickets(ticketService.countTicketsByStatus(TicketStatus.CLOSED));

        stats.setTotalRevenue(orderService.calculateTotalRevenueByStatus(OrderStatus.DELIVERED));
        stats.setPendingRevenue(orderService.calculateTotalRevenueByStatus(OrderStatus.PENDING));

        return stats;
    }
}

