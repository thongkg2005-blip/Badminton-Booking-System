package com.example.booking.controller;

import com.example.booking.model.CourtPrice;
import com.example.booking.model.CourtPriceDayType;
import com.example.booking.repository.CourtPriceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CourtPriceController {

    private final CourtPriceRepository courtPriceRepository;

    public CourtPriceController(CourtPriceRepository courtPriceRepository) {
        this.courtPriceRepository = courtPriceRepository;
    }

    @GetMapping("/court-prices")
    public ResponseEntity<List<CourtPrice>> getCourtPrices(
            @RequestParam(required = false) CourtPriceDayType dayType) {
        List<CourtPrice> prices = dayType != null
                ? courtPriceRepository.findByDayTypeOrderByStartTimeAsc(dayType)
                : courtPriceRepository.findAll().stream()
                    .sorted(Comparator
                            .comparing(CourtPrice::getStartTime)
                            .thenComparing(CourtPrice::getDayType))
                    .toList();

        return ResponseEntity.ok(prices);
    }

    @PutMapping("/admin/court-prices/{id}")
    public ResponseEntity<CourtPrice> updateCourtPrice(@PathVariable Long id,
                                                       @RequestBody CourtPriceRequest req) {
        CourtPrice courtPrice = courtPriceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Court price not found"));

        if (req == null || req.priceVnd == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceVnd is required");
        }
        if (req.priceVnd < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceVnd must be greater than or equal to 0");
        }

        courtPrice.setPriceVnd(req.priceVnd);
        return ResponseEntity.ok(courtPriceRepository.save(courtPrice));
    }

    @PutMapping("/admin/court-prices")
    public ResponseEntity<CourtPrice> updateCourtPriceBySlot(@RequestBody CourtPriceRequest req) {
        if (req == null || req.startTime == null || req.endTime == null || req.dayType == null || req.priceVnd == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime, endTime, dayType and priceVnd are required");
        }
        if (req.priceVnd < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceVnd must be greater than or equal to 0");
        }

        CourtPrice courtPrice = courtPriceRepository
                .findByStartTimeAndEndTimeAndDayType(
                        java.time.LocalTime.parse(req.startTime),
                        java.time.LocalTime.parse(req.endTime),
                        req.dayType)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Court price not found"));

        courtPrice.setPriceVnd(req.priceVnd);
        return ResponseEntity.ok(courtPriceRepository.save(courtPrice));
    }

    @GetMapping("/court-prices/day-types")
    public ResponseEntity<Map<String, CourtPriceDayType[]>> getCourtPriceDayTypes() {
        return ResponseEntity.ok(Map.of("dayTypes", CourtPriceDayType.values()));
    }

    public static class CourtPriceRequest {
        public String startTime;
        public String endTime;
        public CourtPriceDayType dayType;
        public Integer priceVnd;
    }
}
