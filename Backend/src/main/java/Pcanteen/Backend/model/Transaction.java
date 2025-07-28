package Pcanteen.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import Pcanteen.Backend.Employee;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;
    
   

    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;
    
    @Column(name = "total_price", nullable = false)
    private Double totalPrice;
    
    @Column(nullable = false)
    private String status;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    @Column(columnDefinition = "TEXT")
    private String responses;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", updatable = false)
    private String createdBy;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTransactionId() {
		return transactionId;
	}

	@Transient
	private String orderBusinessId;

	@Transient
	private String menuBusinessId;

	@Transient
	private String employeeBusinessId;


    @PostLoad
    private void populateBusinessIds() {
        if (order != null) {
            this.orderBusinessId = order.getId().toString(); // or your business ID logic
        }
        if (menuItem != null) {
            this.menuBusinessId = menuItem.getMenuId();
        }
        if (employee != null) {
            this.employeeBusinessId = employee.getEmployeeId();
        }
    }
	
	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}

	public Order getOrder() {
		return order;
	}

	public void setOrder(Order order) {
		this.order = order;
	}

	public Employee getEmployee() {
		return employee;
	}

	public void setEmployee(Employee employee) {
		this.employee = employee;
	}

	public MenuItem getMenuItem() {
		return menuItem;
	}

	public void setMenuItem(MenuItem menuItem) {
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

	public Transaction(Long id, String transactionId, Order order, Employee employee, MenuItem menuItem,
			Integer quantity, Double unitPrice, Double totalPrice, String status, String remarks, String responses,
			LocalDateTime createdAt, String createdBy, LocalDateTime updatedAt, String updatedBy) {
		super();
		this.id = id;
		this.transactionId = transactionId;
		this.order = order;
		this.employee = employee;
		this.menuItem = menuItem;
		this.quantity = quantity;
		this.unitPrice = unitPrice;
		this.totalPrice = totalPrice;
		this.status = status;
		this.remarks = remarks;
		this.responses = responses;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
		this.updatedAt = updatedAt;
		this.updatedBy = updatedBy;
	}

	public Transaction() {
		super();
		// TODO Auto-generated constructor stub
	}
    
	 public void addRemark(String remark, String user) {
	        String timestamp = LocalDateTime.now().toString();
	        if (this.remarks == null || this.remarks.isEmpty()) {
	            this.remarks = timestamp + " - " + user + ": " + remark;
	        } else {
	            this.remarks += "\n" + timestamp + " - " + user + ": " + remark;
	        }
	        this.status = "MODIFIED";
	    }

	    public void addResponse(String response, String user) {
	        String timestamp = LocalDateTime.now().toString();
	        if (this.responses == null || this.responses.isEmpty()) {
	            this.responses = timestamp + " - " + user + ": " + response;
	        } else {
	            this.responses += "\n" + timestamp + " - " + user + ": " + response;
	        }
	    }
}