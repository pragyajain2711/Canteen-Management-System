package Pcanteen.Backend.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PriceHistoryDTO {
    private Double price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean wasActive;
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
	public Boolean getWasActive() {
		return wasActive;
	}
	public void setWasActive(Boolean wasActive) {
		this.wasActive = wasActive;
	}
	public PriceHistoryDTO(Double price, LocalDateTime startDate, LocalDateTime endDate, Boolean wasActive) {
		super();
		this.price = price;
		this.startDate = startDate;
		this.endDate = endDate;
		this.wasActive = wasActive;
	}
	public PriceHistoryDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
		return "PriceHistoryDTO [price=" + price + ", startDate=" + startDate + ", endDate=" + endDate + ", wasActive="
				+ wasActive + "]";
	}
    
    
}