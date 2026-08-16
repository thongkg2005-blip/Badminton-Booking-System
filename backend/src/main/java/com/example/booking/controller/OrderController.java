package com.example.booking.controller;

import com.example.booking.model.Order;
import com.example.booking.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(Authentication authentication, @RequestBody CreateOrderRequest request) {
        if (request == null || request.items == null || request.items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order items are required");
        }

        String username = currentUsername(authentication);
        Order order = orderService.createOrder(
                request.customerName,
                request.customerEmail,
                request.customerPhone,
                request.shippingAddress,
                request.paymentMethod,
                request.items,
                username
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrder(id, currentUsername(authentication)));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrdersForUser(currentUsername(authentication)));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/admin/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        if (request == null || request.status == null || request.status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status is required");
        }

        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.status));
    }

    public static class CreateOrderRequest {
        public String customerName;
        public String customerEmail;
        public String customerPhone;
        public String shippingAddress;
        public String paymentMethod;
        public List<OrderService.OrderLineRequest> items;
    }

    public static class UpdateOrderStatusRequest {
        public String status;
    }

    private String currentUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        return authentication.getName();
    }
}
