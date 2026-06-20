package com.sentinel.events.adapter.in.rest;

import com.sentinel.common.dto.ApiResponse;
import com.sentinel.events.application.dto.EventResponse;
import com.sentinel.events.application.service.EventStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventStoreService eventStoreService;

    @GetMapping("/{aggregateId}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventStream(@PathVariable UUID aggregateId) {
        return ResponseEntity.ok(ApiResponse.success(eventStoreService.findByAggregate(aggregateId)));
    }
}
