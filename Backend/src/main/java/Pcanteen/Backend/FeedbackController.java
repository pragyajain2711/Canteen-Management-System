package Pcanteen.Backend;

import org.springframework.web.bind.annotation.*;
import Pcanteen.Backend.Feedback.FeedbackType;
import Pcanteen.Backend.dto.FeedbackRequest;
import Pcanteen.Backend.exception.CustomException;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.core.ParameterizedTypeReference;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;
    
    @Autowired
    private RestTemplate restTemplate;

    public FeedbackController(FeedbackRepository feedbackRepository, 
                            EmployeeRepository employeeRepository) {
        this.feedbackRepository = feedbackRepository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/notifications")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Feedback>> createNotification(@RequestBody FeedbackRequest request) {
        Employee sender = employeeRepository.findByEmployeeId(request.getSenderId())
            .orElseThrow(() -> new CustomException("Sender not found"));
        
        List<Feedback> notifications;
        
        if (request.getRecipientId() != null && !request.getRecipientId().isEmpty()) {
            // Send to specific employee
            Employee recipient = employeeRepository.findByEmployeeId(request.getRecipientId())
                .orElseThrow(() -> new CustomException("Recipient not found"));
            
            Feedback notification = createNotificationInstance(request, sender, recipient.getEmployeeId());
            notifications = List.of(feedbackRepository.save(notification));
        } else {
            // Get all non-admin employees (customers) from EmployeeRepository
            List<Employee> customers = employeeRepository.findByIsAdminFalseAndIsSuperAdminFalse();
            
            notifications = customers.stream()
                .map(customer -> {
                    Feedback notification = createNotificationInstance(request, sender, customer.getEmployeeId());
                    return feedbackRepository.save(notification);
                })
                .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/notifications/{id}/read")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Feedback> markAsRead(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        Feedback notification = feedbackRepository.findById(id)
            .orElseThrow(() -> new CustomException("Notification not found"));
        
        if (!notification.getRecipientId().equals(currentUserId)) {
            throw new CustomException("Not authorized to mark this notification as read");
        }

        notification.setRead(true);
        notification.setStatus("READ");
        return ResponseEntity.ok(feedbackRepository.save(notification));
    }

    /*@GetMapping("/notifications/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Feedback>> getMyNotifications() {
        String currentUserId = getCurrentUserId();
        List<Feedback> notifications = feedbackRepository.findByRecipientId(currentUserId);
        notifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(notifications);
    }*/
    
    @GetMapping("/notifications/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Feedback>> getMyNotifications() {
        String currentUserId = getCurrentUserId();

        List<String> roles = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
            .stream()
            .map(auth -> auth.getAuthority())
            .collect(Collectors.toList());

        List<Feedback> notifications;

        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_SUPER_ADMIN")) {
            // Admin sees only the notifications they SENT
            notifications = feedbackRepository.findBySenderId(currentUserId);
        } else {
            // Employee sees notifications they RECEIVED
            notifications = feedbackRepository.findByRecipientId(currentUserId);
        }

        notifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(notifications);
    }


/*
    @DeleteMapping("/notifications")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> clearAllNotifications() {
        String currentUserId = getCurrentUserId();
        feedbackRepository.deleteByRecipientId(currentUserId);
        return ResponseEntity.ok().build();
    }*/


    @PostMapping("/suggestions")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Feedback> createSuggestion(@RequestBody FeedbackRequest request) {
        String currentUserId = getCurrentUserId();
        Employee sender = employeeRepository.findByEmployeeId(currentUserId)
            .orElseThrow(() -> new CustomException("Employee not found"));

        Feedback suggestion = new Feedback();
        suggestion.setType(FeedbackType.SUGGESTION);
        suggestion.setTitle("Suggestion from " + sender.getFirstName());
        suggestion.setContent(request.getContent());
        suggestion.setSenderId(sender.getEmployeeId());
        suggestion.setSenderName(sender.getFirstName() + " " + sender.getLastName());
        suggestion.setCreatedAt(LocalDateTime.now());
        suggestion.setStatus("PENDING");

        return ResponseEntity.ok(feedbackRepository.save(suggestion));
    }
    
    /*@PatchMapping("/notifications/clear")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> clearNotifications() {
        String currentUserId = getCurrentUserId();
        List<Feedback> notifications = feedbackRepository.findByRecipientId(currentUserId);
        
        notifications.forEach(notification -> {
            notification.setRead(true);
            notification.setStatus("READ");
            feedbackRepository.save(notification);
        });
        
        return ResponseEntity.ok().build();
    }*/

    @GetMapping("/suggestions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Feedback>> getAllSuggestions(
        @RequestParam(required = false) String status) {
        
        if (status != null) {
            return ResponseEntity.ok(feedbackRepository.findByTypeAndStatus(
                FeedbackType.SUGGESTION, status));
        }
        return ResponseEntity.ok(feedbackRepository.findByType(FeedbackType.SUGGESTION));
    }
    
    @GetMapping("/suggestions/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Feedback>> getMySuggestions() {
        String currentUserId = getCurrentUserId();
        return ResponseEntity.ok(feedbackRepository.findBySenderId(currentUserId));
    }

    @PostMapping("/suggestions/{id}/respond")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Feedback> respondToSuggestion(
        @PathVariable Long id,
        @RequestBody String response) {
        
        Feedback suggestion = feedbackRepository.findById(id)
            .orElseThrow(() -> new CustomException("Suggestion not found"));
        
        suggestion.setResponse(response);
        suggestion.setResponseAt(LocalDateTime.now());
        suggestion.setStatus("RESOLVED");
        
        return ResponseEntity.ok(feedbackRepository.save(suggestion));
    }

    private Feedback createNotificationInstance(FeedbackRequest request, Employee sender, String recipientId) {
        Feedback notification = new Feedback();
        notification.setType(FeedbackType.NOTIFICATION);
        notification.setTitle(request.getTitle() != null ? request.getTitle() : "Notification from Admin");
        notification.setContent(request.getContent());
        notification.setSenderId(sender.getEmployeeId());
        notification.setSenderName(sender.getFirstName() + " " + sender.getLastName());
        notification.setRecipientId(recipientId);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setStatus("SENT");
        notification.setRead(false);
        return notification;
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}