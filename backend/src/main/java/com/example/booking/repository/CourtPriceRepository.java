package com.example.booking.repository;

import com.example.booking.model.CourtPrice;
import com.example.booking.model.CourtPriceDayType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface CourtPriceRepository extends JpaRepository<CourtPrice, Long> {
    List<CourtPrice> findByDayTypeOrderByStartTimeAsc(CourtPriceDayType dayType);
    Optional<CourtPrice> findByStartTimeAndEndTimeAndDayType(LocalTime startTime, LocalTime endTime, CourtPriceDayType dayType);
}
