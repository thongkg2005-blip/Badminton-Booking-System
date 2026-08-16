package com.example.booking.repository;

import com.example.booking.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByUser_IdOrderByPurchaseDateDesc(Long userId);

	List<Order> findAllByOrderByPurchaseDateDesc();
}
