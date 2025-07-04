
package Pcanteen.Backend;
import Pcanteen.Backend.EmployeeRepository;


import Pcanteen.Backend.dto.AuthRequest;
import Pcanteen.Backend.dto.ResetPasswordRequest;
import Pcanteen.Backend.EmailService;
import Pcanteen.Backend.dto.AuthResponse;
import Pcanteen.Backend.dto.SignUpRequest;
import Pcanteen.Backend.exception.CustomException;
import Pcanteen.Backend.Employee;
import Pcanteen.Backend.security.CustomUserDetailsService;
import Pcanteen.Backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    public AdminController(EmployeeRepository employeeRepository) {
		super();
		this.employeeRepository = employeeRepository;
	}

	@GetMapping("/employees")  // Changed from "/users" to match frontend
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @PostMapping("/promote")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> promoteToAdmin(@RequestBody PromoteRequest request) {  // Changed to use RequestBody
        Employee employee = employeeRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new CustomException("Employee not found"));
        
        employee.setAdmin(true);
        employeeRepository.save(employee);
        return ResponseEntity.ok("Employee promoted to admin");
    }

    @PostMapping("/demote")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> demoteAdmin(@RequestBody PromoteRequest request) {  // Changed to use RequestBody
        Employee employee = employeeRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new CustomException("Employee not found"));
        
        employee.setAdmin(false);
        employeeRepository.save(employee);
        return ResponseEntity.ok("Admin demoted to regular employee");
    }
    
    // Add this DTO class inside the controller file
    static class PromoteRequest {
        private String employeeId;
        
        // Getter and setter
        public String getEmployeeId() {
            return employeeId;
        }
        
        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }
    }
 // Existing methods...

    // New endpoints for Customer Management
    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Employee>> getAllCustomers() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @PostMapping("/customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Employee> createCustomer(@RequestBody Employee employee) {
        if (employeeRepository.existsByEmployeeId(employee.getEmployeeId())) {
            throw new CustomException("Employee ID already exists");
        }
        employee.setAdmin(false);
        employee.setSuperAdmin(false);
        return ResponseEntity.ok(employeeRepository.save(employee));
    }

    @GetMapping("/customers/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Employee> getCustomerById(@PathVariable Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new CustomException("Customer not found"));
        return ResponseEntity.ok(employee);
    }
    
    
    @PutMapping("/customers/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Employee> updateCustomer(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new CustomException("Customer not found"));
        
        employee.setFirstName(employeeDetails.getFirstName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setDepartment(employeeDetails.getDepartment());
        employee.setMobileNumber(employeeDetails.getMobileNumber());
        employee.setCustomerType(employeeDetails.getCustomerType());
        employee.setIsActive(employeeDetails.isActive());
        
        if (employeeDetails.getPassword() != null && !employeeDetails.getPassword().isEmpty()) {
            employee.setPassword(employeeDetails.getPassword());
        }
        
        return ResponseEntity.ok(employeeRepository.save(employee));
    }
    
  
    @PatchMapping("/customers/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Employee> updateCustomerStatus(@PathVariable Long id, @RequestParam boolean active) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new CustomException("Customer not found"));
        
        employee.setIsActive(active);
        Employee savedEmployee = employeeRepository.save(employee);
        
        // Add logging to debug
        System.out.println("Updated customer " + id + " status to: " + active);
        System.out.println("Saved employee isActive: " + savedEmployee.isActive());
        
        return ResponseEntity.ok(savedEmployee);
    }
    
 

    
    @GetMapping("/customers/filter")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Employee>> getFilteredCustomers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean isActive,
        @RequestParam(required = false) String customerType,
        @RequestParam(required = false) String rangeType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Employee> customers;
        LocalDateTime now = LocalDateTime.now();
        
        // Apply date range filter first
        if (rangeType != null) {
            switch (rangeType.toLowerCase()) {
                case "today":
                    customers = employeeRepository.findByCreatedAtAfter(now.with(LocalTime.MIN));
                    break;
                case "week":
                    customers = employeeRepository.findByCreatedAtAfter(now.minusWeeks(1));
                    break;
                case "month":
                    customers = employeeRepository.findByCreatedAtAfter(now.minusMonths(1));
                    break;
                case "year":
                    customers = employeeRepository.findByCreatedAtAfter(now.minusYears(1));
                    break;
                case "custom":
                    if (startDate != null && endDate != null) {
                        customers = employeeRepository.findByCreatedAtBetween(startDate, endDate);
                    } else {
                        customers = employeeRepository.findAll();
                    }
                    break;
                default:
                    customers = employeeRepository.findAll();
            }
        } else {
            customers = employeeRepository.findAll();
        }
        
        // Apply other filters
        if (isActive != null) {
            customers = customers.stream()
                .filter(employee -> employee.isActive() == isActive)
                .collect(Collectors.toList());
        }
        
        if (customerType != null && !customerType.isEmpty()) {
            customers = customers.stream()
                .filter(employee -> customerType.equalsIgnoreCase(employee.getCustomerType()))
                .collect(Collectors.toList());
        }
        
        // Apply search filter
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            customers = customers.stream()
                .filter(employee -> 
                    (employee.getEmployeeId() != null && employee.getEmployeeId().toLowerCase().contains(searchLower)) ||
                    (employee.getFirstName() != null && employee.getFirstName().toLowerCase().contains(searchLower)) ||
                    (employee.getLastName() != null && employee.getLastName().toLowerCase().contains(searchLower)) ||
                    (employee.getDepartment() != null && employee.getDepartment().toLowerCase().contains(searchLower)) ||
                    (employee.getCustomerType() != null && employee.getCustomerType().toLowerCase().contains(searchLower))
                )
                .collect(Collectors.toList());
        }
        
        // Filter out superadmins
        List<Employee> filteredCustomers = customers.stream()
            .filter(employee -> !employee.isSuperAdmin())
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(filteredCustomers);
    }
}