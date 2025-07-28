package Pcanteen.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import Pcanteen.Backend.Employee;
import Pcanteen.Backend.model.MenuItem;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;
    
    
    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_at_order", nullable = false)
    private Double priceAtOrder;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @CreationTimestamp
    @Column(name = "order_time", nullable = false, updatable = false)
    private LocalDateTime orderTime;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate; // Optional field

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    // Transient fields with getters only (no setters needed)
    @Transient
    private String itemName;

    @Transient
    private String department;

    @Transient
    private String category;

    // PostLoad callback to populate transient fields
    @PostLoad
    private void populateTransientFields() {
        if (menuItem != null) {
            this.itemName = menuItem.getName();
            this.category = menuItem.getCategory();
        }
        if (employee != null) {
            this.department = employee.getDepartment();
        }
    }

    // Getters for transient fields
    @Transient
    public String getItemName() {
        return menuItem != null ? menuItem.getName() : null;
    }

    public String getDepartment() {
        return department;
    }
    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Double getPriceAtOrder() {
		return priceAtOrder;
	}

	public void setPriceAtOrder(Double priceAtOrder) {
		this.priceAtOrder = priceAtOrder;
	}

	public Double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
	}

	public LocalDateTime getOrderTime() {
		return orderTime;
	}

	public void setOrderTime(LocalDateTime orderTime) {
		this.orderTime = orderTime;
	}

	public LocalDate getExpectedDeliveryDate() {
		return expectedDeliveryDate;
	}

	public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
		this.expectedDeliveryDate = expectedDeliveryDate;
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

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Order(Long id, Employee employee, MenuItem menuItem, Integer quantity, Double priceAtOrder,
			Double totalPrice, LocalDateTime orderTime, LocalDate expectedDeliveryDate, String status, String remarks,
			String createdBy) {
		super();
		this.id = id;
		this.employee = employee;
		this.menuItem = menuItem;
		this.quantity = quantity;
		this.priceAtOrder = priceAtOrder;
		this.totalPrice = totalPrice;
		this.orderTime = orderTime;
		this.expectedDeliveryDate = expectedDeliveryDate;
		this.status = status;
		this.remarks = remarks;
		this.createdBy = createdBy;
	}

	public Order() {
		super();
		// TODO Auto-generated constructor stub
	}

	@Override
	public String toString() {
		return "Order [id=" + id + ", employee=" + employee + ", menuItem=" + menuItem + ", quantity=" + quantity
				+ ", priceAtOrder=" + priceAtOrder + ", totalPrice=" + totalPrice + ", orderTime=" + orderTime
				+ ", expectedDeliveryDate=" + expectedDeliveryDate + ", status=" + status + ", remarks=" + remarks
				+ ", createdBy=" + createdBy + "]";
	}
    
    
}