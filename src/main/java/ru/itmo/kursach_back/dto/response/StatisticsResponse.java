package ru.itmo.kursach_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsResponse {

    private Long totalUsers;
    private Long totalOrders;
    private Long totalDesigns;
    private Long totalTickets;

    private Long pendingOrders;
    private Long processingOrders;
    private Long completedOrders;

    private Long openTickets;
    private Long inProgressTickets;
    private Long closedTickets;

    private Double totalRevenue;
    private Double pendingRevenue;

    private Long publicDesigns;
    private Long privateDesigns;
}

