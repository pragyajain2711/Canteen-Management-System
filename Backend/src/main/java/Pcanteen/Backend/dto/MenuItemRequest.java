package Pcanteen.Backend.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MenuItemRequest {
    private String name;
    private String description;
    private Double quantity;
    private String unit;
    private Double price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String category;
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
	public MenuItemRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public MenuItemRequest(String name, String description, Double quantity, String unit, Double price,
			LocalDateTime startDate, LocalDateTime endDate, String category) {
		super();
		this.name = name;
		this.description = description;
		this.quantity = quantity;
		this.unit = unit;
		this.price = price;
		this.startDate = startDate;
		this.endDate = endDate;
		this.category = category;
	}
	@Override
	public String toString() {
		return "MenuItemRequest [name=" + name + ", description=" + description + ", quantity=" + quantity + ", unit="
				+ unit + ", price=" + price + ", startDate=" + startDate + ", endDate=" + endDate + ", category="
				+ category + "]";
	}
	
    
}