package com.example.booking.service;

import com.example.booking.model.Branch;
import com.example.booking.model.Order;
import com.example.booking.model.OrderItem;
import com.example.booking.model.Product;
import com.example.booking.model.User;
import com.example.booking.repository.OrderRepository;
import com.example.booking.repository.ProductRepository;
import com.example.booking.repository.UserRepository;
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

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(5_000_000);
    private static final BigDecimal STANDARD_SHIPPING_FEE = BigDecimal.valueOf(50_000);
    private static final List<String> SUPPORTED_PAYMENT_METHODS = List.of("ONLINE", "COD");
    private static final List<String> SUPPORTED_ORDER_STATUSES = List.of("PENDING", "CONFIRMED", "SHIPPING", "COMPLETED");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long orderId, String username) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    ensureOrderAccess(order, username);
                    return order;
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
    }

    @Transactional
    public Order createOrder(
            String customerName,
            String customerEmail,
            String customerPhone,
            String shippingAddress,
            String paymentMethod,
            List<OrderLineRequest> lines,
            String username
    ) {
        if (lines == null || lines.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        String trimmedName = customerName != null ? customerName.trim() : "";
        if (trimmedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer name is required");
        }

        String trimmedEmail = customerEmail != null ? customerEmail.trim() : "";
        String trimmedPhone = customerPhone != null ? customerPhone.trim() : "";
        String trimmedAddress = shippingAddress != null ? shippingAddress.trim() : "";
        String normalizedPaymentMethod = paymentMethod != null ? paymentMethod.trim().toUpperCase() : "";

        if (trimmedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer email is required");
        }
        if (trimmedPhone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer phone is required");
        }
        if (trimmedAddress.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipping address is required");
        }
        if (!normalizedPaymentMethod.isBlank() && !SUPPORTED_PAYMENT_METHODS.contains(normalizedPaymentMethod)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported payment method");
        }
        if (normalizedPaymentMethod.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required");
        }

        User user = resolveUser(username);

        Map<Long, Integer> quantityByProduct = mergeDuplicateLines(lines);
        Branch branch = null;
        BigDecimal itemSubtotal = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomerName(trimmedName);
        order.setCustomerEmail(trimmedEmail);
        order.setCustomerPhone(trimmedPhone);
        order.setShippingAddress(trimmedAddress);
        order.setPaymentMethod(normalizedPaymentMethod);
        order.setPaymentStatus("COD".equals(normalizedPaymentMethod) ? "PENDING" : "PAID");
        order.setOrderStatus("ONLINE".equals(normalizedPaymentMethod) ? "CONFIRMED" : "PENDING");
        order.setUser(user);

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
            itemSubtotal = itemSubtotal.add(subtotal);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setSubtotal(subtotal);
            order.addItem(item);
        }

        order.setBranch(branch);
        order.setTotalAmount(itemSubtotal);
        order.setShippingAmount(calculateShipping(itemSubtotal));

        try {
            return orderRepository.saveAndFlush(order);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Unable to complete order due to stock or data constraints");
        }
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersForUser(String username) {
        User user = resolveUser(username);
        return orderRepository.findByUser_IdOrderByPurchaseDateDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByPurchaseDateDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        String normalizedStatus = status != null ? status.trim().toUpperCase() : "";
        if (!SUPPORTED_ORDER_STATUSES.contains(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported order status");
        }

        order.setOrderStatus(normalizedStatus);
        return orderRepository.save(order);
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

    private BigDecimal calculateShipping(BigDecimal subtotal) {
        if (subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return subtotal.compareTo(FREE_SHIPPING_THRESHOLD) > 0 ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;
    }

    private User resolveUser(String username) {
        String trimmedUsername = username != null ? username.trim() : "";
        if (trimmedUsername.isBlank() || "anonymousUser".equals(trimmedUsername)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        return userRepository.findByUsername(trimmedUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void ensureOrderAccess(Order order, String username) {
        if (order.getUser() == null) {
            return;
        }

        User currentUser = resolveUser(username);
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this order");
        }
    }

    public static class OrderLineRequest {
        public Long productId;
        public Integer quantity;
    }
}
