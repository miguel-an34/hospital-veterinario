package br.edu.vetcare.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatusController {
    private final JdbcClient jdbcClient;

    public StatusController(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @GetMapping({"/", "/status"})
    public Map<String, Object> status() {
        Integer database = jdbcClient.sql("SELECT 1").query(Integer.class).single();
        return Map.of(
                "service", "vetcare-api",
                "status", "online",
                "database", database == 1 ? "connected" : "unavailable",
                "timestamp", Instant.now());
    }
}
