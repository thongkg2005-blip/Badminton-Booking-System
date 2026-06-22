package com.example.booking.service;

import com.example.booking.model.Branch;
import com.example.booking.model.Order;
import com.example.booking.model.OrderItem;
import com.example.booking.model.Product;
import com.example.booking.repository.OrderRepository;
import com.example.booking.repository.ProductRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
    }

    @Transactional
    public Order createOrder(String customerName, List<OrderLineRequest> lines) {
        if (lines == null || lines.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        String trimmedName = customerName != null ? customerName.trim() : "";
        if (trimmedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer name is required");
        }

        Map<Long, Integer> quantityByProduct = mergeDuplicateLines(lines);
        Branch branch = null;
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomerName(trimmedName);

        for (Map.Entry<Long, Integer> entry : quantityByProduct.entrySet()) {
            Long productId = entry.getKey();
            int quantity = entry.getValue();

            if (quantity <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Product not found: " + productId));

            if (product.getStock() < quantity) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Insufficient stock for product: " + product.getName());
            }

            if (branch == null) {
                branch = product.getBranch();
            } else if (!branch.getId().equals(product.getBranch().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "All products must belong to the same branch");
            }

            BigDecimal unitPrice = discountedUnitPrice(product);
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(subtotal);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setSubtotal(subtotal);
            order.addItem(item);
        }

        order.setBranch(branch);
        order.setTotalAmount(totalAmount);

        try {
            return orderRepository.saveAndFlush(order);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Unable to complete order due to stock or data constraints");
        }
    }

    private Map<Long, Integer> mergeDuplicateLines(List<OrderLineRequest> lines) {
        Map<Long, Integer> quantityByProduct = new HashMap<>();
        for (OrderLineRequest line : lines) {
            if (line == null || line.productId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each order item must include productId");
            }
            quantityByProduct.merge(line.productId, line.quantity != null ? line.quantity : 0, Integer::sum);
        }
        return quantityByProduct;
    }

    private BigDecimal discountedUnitPrice(Product product) {
        int discount = product.getDiscount() != null ? product.getDiscount() : 0;
        BigDecimal multiplier = BigDecimal.valueOf(100 - discount)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return product.getPrice().multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    public static class OrderLineRequest {
        public Long productId;
        public Integer quantity;
    }
}
