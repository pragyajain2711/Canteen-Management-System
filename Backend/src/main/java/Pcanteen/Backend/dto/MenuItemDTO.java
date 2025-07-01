package Pcanteen.Backend.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MenuItemDTO {
    private Long id;
    private String menuId;
    private String name;
    private String description;
    private Double quantity;
    private String unit;
    private Double price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String category;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
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
	public MenuItemDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public MenuItemDTO(Long id, String menuId, String name, String description, Double quantity, String unit,
			Double price, LocalDateTime startDate, LocalDateTime endDate, String category, Boolean isActive,
			LocalDateTime createdAt, String createdBy, LocalDateTime updatedAt, String updatedBy) {
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
	}
	@Override
	public String toString() {
		return "MenuItemDTO [id=" + id + ", menuId=" + menuId + ", name=" + name + ", description=" + description
				+ ", quantity=" + quantity + ", unit=" + unit + ", price=" + price + ", startDate=" + startDate
				+ ", endDate=" + endDate + ", category=" + category + ", isActive=" + isActive + ", createdAt="
				+ createdAt + ", createdBy=" + createdBy + ", updatedAt=" + updatedAt + ", updatedBy=" + updatedBy
				+ "]";
	}
    
    
}
