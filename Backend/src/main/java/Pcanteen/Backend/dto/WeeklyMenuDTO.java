package Pcanteen.Backend.dto;

//import Pcanteen.Backend.dto.DayOfWeek;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WeeklyMenuDTO {
    private Long id;
    private LocalDateTime weekStartDate;
    private LocalDateTime weekEndDate;
    private DayOfWeek dayOfWeek;
    private String mealCategory;
    private MenuItemDTO menuItem;
    private LocalDateTime createdAt;
    private String createdBy;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public LocalDateTime getWeekStartDate() {
		return weekStartDate;
	}
	public void setWeekStartDate(LocalDateTime weekStartDate) {
		this.weekStartDate = weekStartDate;
	}
	public LocalDateTime getWeekEndDate() {
		return weekEndDate;
	}
	public void setWeekEndDate(LocalDateTime weekEndDate) {
		this.weekEndDate = weekEndDate;
	}
	public DayOfWeek getDayOfWeek() {
		return dayOfWeek;
	}
	public void setDayOfWeek(DayOfWeek dayOfWeek) {
		this.dayOfWeek = dayOfWeek;
	}
	public String getMealCategory() {
		return mealCategory;
	}
	public void setMealCategory(String mealCategory) {
		this.mealCategory = mealCategory;
	}
	public MenuItemDTO getMenuItem() {
		return menuItem;
	}
	public void setMenuItem(MenuItemDTO menuItem) {
		this.menuItem = menuItem;
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
	public WeeklyMenuDTO(Long id, LocalDateTime weekStartDate, LocalDateTime weekEndDate,
			Pcanteen.Backend.dto.DayOfWeek dayOfWeek, String mealCategory, MenuItemDTO menuItem,
			LocalDateTime createdAt, String createdBy) {
		super();
		this.id = id;
		this.weekStartDate = weekStartDate;
		this.weekEndDate = weekEndDate;
		this.dayOfWeek = dayOfWeek;
		this.mealCategory = mealCategory;
		this.menuItem = menuItem;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
	}
	@Override
	public String toString() {
		return "WeeklyMenuDTO [id=" + id + ", weekStartDate=" + weekStartDate + ", weekEndDate=" + weekEndDate
				+ ", dayOfWeek=" + dayOfWeek + ", mealCategory=" + mealCategory + ", menuItem=" + menuItem
				+ ", createdAt=" + createdAt + ", createdBy=" + createdBy + "]";
	}
	public WeeklyMenuDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
}
