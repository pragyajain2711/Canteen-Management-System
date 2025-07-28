/*package Pcanteen.Backend.dto;

import java.time.LocalDateTime;
import java.time.LocalDate;

public class OrderResponseDTO {
    private Long id;
    private String status;
    private Double totalPrice;
    private LocalDateTime orderTime;
    private LocalDate expectedDeliveryDate;
    private String remarks;
    private String employeeName;
    private String menuItemName;
    
    // Constructor
    public OrderResponseDTO(Long id, String status, Double totalPrice, 
                           LocalDateTime orderTime, LocalDate expectedDeliveryDate,
                           String remarks, String employeeFullName, String menuItemName) {
        this.id = id;
        this.status = status;
        this.totalPrice = totalPrice;
        this.orderTime = orderTime;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.remarks = remarks;
        this.employeeName = employeeFullName;
        this.menuItemName = menuItemName;
    }
    
    // Getters (no setters needed for DTO)
    public Long getId() { return id; }
    public String getStatus() { return status; }
    public Double getTotalPrice() { return totalPrice; }
    public LocalDateTime getOrderTime() { return orderTime; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public String getRemarks() { return remarks; }
    public String getEmployeeName() { return employeeName; }
    public String getMenuItemName() { return menuItemName; }
    
    
}*/

package Pcanteen.Backend.dto;

import java.time.LocalDateTime;
import java.time.LocalDate;

public class OrderResponseDTO {
    private Long id;
    private String status;
    private Double totalPrice;
    private LocalDateTime orderTime;
    private LocalDate expectedDeliveryDate;
    private String remarks;
    private String employeeName;
    private String menuItemName;
    private String employeeId;    // Business ID
    private String menuId;        // Business ID
    
    // Updated constructor
    public OrderResponseDTO(Long id, String status, Double totalPrice, 
                           LocalDateTime orderTime, LocalDate expectedDeliveryDate,
                           String remarks, String employeeName, String menuItemName,
                           String employeeId, String menuId) {
        // ... initialize all fields ...
        this.employeeId = employeeId;
        this.menuId = menuId;
    }
    
    public Long getId() {
		return id;
	}

	public String getStatus() {
		return status;
	}

	public Double getTotalPrice() {
		return totalPrice;
	}

	public LocalDateTime getOrderTime() {
		return orderTime;
	}

	public LocalDate getExpectedDeliveryDate() {
		return expectedDeliveryDate;
	}

	public String getRemarks() {
		return remarks;
	}

	public String getEmployeeName() {
		return employeeName;
	}

	public String getMenuItemName() {
		return menuItemName;
	}

	// Add getters for new fields
    public String getEmployeeId() { return employeeId; }
    public String getMenuId() { return menuId; }
}