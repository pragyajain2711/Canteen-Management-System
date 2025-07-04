package Pcanteen.Backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Long id;
    private String transactionId;
    private OrderResponseDTO order;
    private AuthResponse employee;
    private MenuItemDTO menuItem;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private String status;
    private String remarks;
    private String responses;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    
    // Business ID fields (not in database, just for API responses)
    private String orderBusinessId;
    private String menuBusinessId;
    private String employeeBusinessId;
    private String employeeName;
    private String menuItemName;
    private String category;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTransactionId() {
		return transactionId;
	}
	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}
	public OrderResponseDTO getOrder() {
		return order;
	}
	public void setOrder(OrderResponseDTO order) {
		this.order = order;
	}
	public AuthResponse getEmployee() {
		return employee;
	}
	public void setEmployee(AuthResponse employee) {
		this.employee = employee;
	}
	public MenuItemDTO getMenuItem() {
		return menuItem;
	}
	public void setMenuItem(MenuItemDTO menuItem) {
		this.menuItem = menuItem;
	}
	public Integer getQuantity() {
		return quantity;
	}
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	public Double getUnitPrice() {
		return unitPrice;
	}
	public void setUnitPrice(Double unitPrice) {
		this.unitPrice = unitPrice;
	}
	public Double getTotalPrice() {
		return totalPrice;
	}
	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	public String getResponses() {
		return responses;
	}
	public void setResponses(String responses) {
		this.responses = responses;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	public String getUpdatedBy() {
		return updatedBy;
	}
	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
	}
	public String getOrderBusinessId() {
		return orderBusinessId;
	}
	public void setOrderBusinessId(String orderBusinessId) {
		this.orderBusinessId = orderBusinessId;
	}
	public String getMenuBusinessId() {
		return menuBusinessId;
	}
	public void setMenuBusinessId(String menuBusinessId) {
		this.menuBusinessId = menuBusinessId;
	}
	public String getEmployeeBusinessId() {
		return employeeBusinessId;
	}
	public void setEmployeeBusinessId(String employeeBusinessId) {
		this.employeeBusinessId = employeeBusinessId;
	}
	public String getEmployeeName() {
		return employeeName;
	}
	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}
	public String getMenuItemName() {
		return menuItemName;
	}
	public void setMenuItemName(String menuItemName) {
		this.menuItemName = menuItemName;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public TransactionDTO() {
		super();
		// TODO Auto-generated constructor stub
	}

    // No need for constructors/getters/setters if using @Data
    
    
}