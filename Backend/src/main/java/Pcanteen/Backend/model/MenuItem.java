package Pcanteen.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import Pcanteen.Backend.dto.MenuItemDTO;

import java.time.LocalDateTime;

@Entity
@Table(name = "menu_items")
@Data
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "menu_id", nullable = false, updatable = false)
    private String menuId; // Unique ID that changes when price changes

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "category", nullable = false)
    private String category; // breakfast, lunch, thali, snacks, beverages

    @Column(name = "is_active", insertable = false) // Calculated field
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "available_status", nullable = false)
    private Boolean availableStatus = true;
    

    public Boolean getAvailableStatus() {
		return availableStatus;
	}

	public void setAvailableStatus(Boolean availableStatus) {
		this.availableStatus = availableStatus;
	}

	// Pre-persist and pre-update hooks to set menuId and isActive
    @PrePersist
    @PreUpdate
    public void prepare() {
        // Generate menuId as name + current timestamp if new
        if (this.menuId == null) {
            this.menuId = this.name.toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis();
        }
        
        // Calculate isActive based on current date and validity period
        LocalDateTime now = LocalDateTime.now();
        this.isActive = !now.isBefore(this.startDate) && !now.isAfter(this.endDate);
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getMenuId() {
		return menuId;
	}

	public void setMenuId(String menuId) {
		this.menuId = menuId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Double getQuantity() {
		return quantity;
	}

	public void setQuantity(Double quantity) {
		this.quantity = quantity;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public LocalDateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDateTime startDate) {
		this.startDate = startDate;
	}

	public LocalDateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDateTime endDate) {
		this.endDate = endDate;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
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

	/*public MenuItem(Long id, String menuId, String name, String description, Double quantity, String unit, Double price,
			LocalDateTime startDate, LocalDateTime endDate, String category, Boolean isActive, LocalDateTime createdAt,
			String createdBy, LocalDateTime updatedAt, String updatedBy) {
		super();
		this.id = id;
		this.menuId = menuId;
		this.name = name;
		this.description = description;
		this.quantity = quantity;
		this.unit = unit;
		this.price = price;
		this.startDate = startDate;
		this.endDate = endDate;
		this.category = category;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
		this.updatedAt = updatedAt;
		this.updatedBy = updatedBy;
	}*/

	public MenuItem() {
		super();
		// TODO Auto-generated constructor stub
	}

	public MenuItem(Long id, String menuId, String name, String description, Double quantity, String unit, Double price,
			LocalDateTime startDate, LocalDateTime endDate, String category, Boolean isActive, LocalDateTime createdAt,
			String createdBy, LocalDateTime updatedAt, String updatedBy, Boolean availableStatus) {
		super();
		this.id = id;
		this.menuId = menuId;
		this.name = name;
		this.description = description;
		this.quantity = quantity;
		this.unit = unit;
		this.price = price;
		this.startDate = startDate;
		this.endDate = endDate;
		this.category = category;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
		this.updatedAt = updatedAt;
		this.updatedBy = updatedBy;
		this.availableStatus = availableStatus;
	}

	/*@Override
	public String toString() {
		return "MenuItem [id=" + id + ", menuId=" + menuId + ", name=" + name + ", description=" + description
				+ ", quantity=" + quantity + ", unit=" + unit + ", price=" + price + ", startDate=" + startDate
				+ ", endDate=" + endDate + ", category=" + category + ", isActive=" + isActive + ", createdAt="
				+ createdAt + ", createdBy=" + createdBy + ", updatedAt=" + updatedAt + ", updatedBy=" + updatedBy
				+ "]";
	}*/
	
	public MenuItemDTO toDTO() {
	    MenuItemDTO dto = new MenuItemDTO();
	    dto.setId(this.id);
	    dto.setMenuId(this.menuId);
	    dto.setName(this.name);
	    dto.setDescription(this.description);
	    dto.setQuantity(this.quantity);
	    dto.setUnit(this.unit);
	    dto.setPrice(this.price);
	    dto.setStartDate(this.startDate);
	    dto.setEndDate(this.endDate);
	    dto.setCategory(this.category);
	    dto.setIsActive(this.isActive);
	    dto.setCreatedAt(this.createdAt);
	    dto.setCreatedBy(this.createdBy);
	    dto.setUpdatedAt(this.updatedAt);
	    dto.setUpdatedBy(this.updatedBy);
	    dto.setAvailableStatus(this.availableStatus);
	    return dto;
	}
    
}