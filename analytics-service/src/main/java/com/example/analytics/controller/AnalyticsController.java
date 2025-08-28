package com.example.analytics.controller;

import com.example.analytics.model.Expense;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/analytics-service")
public class AnalyticsController {

    // Updated to match your Go backend routes
   // private final String EXPENSE_SERVICE_URL = "http://3.91.202.159:8080/expense-service";
    private final String EXPENSE_SERVICE_URL = "http://expense-service:8080/expenses";

    @GetMapping("/summary/{userId}")
    public Map<String, Object> getSummary(@PathVariable int userId) {
        RestTemplate restTemplate = new RestTemplate();

        // Call the correct route to fetch user expenses
        Expense[] expenses = restTemplate.getForObject(EXPENSE_SERVICE_URL + "/" + userId, Expense[].class);
        System.out.println("expenses " + Arrays.toString(expenses));

        double totalAmount = 0;
        Map<String, Double> categoryTotals = new HashMap<>();

        if (expenses != null) {
            for (Expense e : expenses) {
                totalAmount += e.getAmount();
                categoryTotals.put(e.getCategory(), categoryTotals.getOrDefault(e.getCategory(), 0.0) + e.getAmount());
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);
        summary.put("expenses", expenses);
        return summary;
    }
}

