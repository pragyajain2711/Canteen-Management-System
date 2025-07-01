package Pcanteen.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "weekly_menus")
@Data
public class WeeklyMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "week_start_date", nullable = false)
    private LocalDateTime weekStartDate;

    @Column(name = "week_end_date", nullable = false)
    private LocalDateTime weekEndDate;

    @Column(name = "day_of_week", nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Column(name = "meal_category", nullable = false)
    private String mealCategory; // breakfast, lunch, thali, snacks, beverages

    @ManyToOne
    @JoinColumn(name = "menu_item_id", referencedColumnName = "menu_id")
    private MenuItem menuItem;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
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

	public MenuItem getMenuItem() {
		return menuItem;
	}

	public void setMenuItem(MenuItem menuItem) {
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

	public WeeklyMenu(Long id, LocalDateTime weekStartDate, LocalDateTime weekEndDate, DayOfWeek dayOfWeek,
			String mealCategory, MenuItem menuItem, LocalDateTime createdAt, String createdBy) {
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

	public WeeklyMenu() {
		super();
		// TODO Auto-generated constructor stub
	}

	@Override
	public String toString() {
		return "WeeklyMenu [id=" + id + ", weekStartDate=" + weekStartDate + ", weekEndDate=" + weekEndDate
				+ ", dayOfWeek=" + dayOfWeek + ", mealCategory=" + mealCategory + ", menuItem=" + menuItem
				+ ", createdAt=" + createdAt + ", createdBy=" + createdBy + "]";
	}

	public void setDayOfWeek(Pcanteen.Backend.dto.DayOfWeek dayOfWeek2) {
		// TODO Auto-generated method stub
		
	}
    
    
}