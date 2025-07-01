package Pcanteen.Backend.repository;

import Pcanteen.Backend.model.WeeklyMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeeklyMenuRepository extends JpaRepository<WeeklyMenu, Long> {
    
   /* @Query("SELECT w FROM WeeklyMenu w WHERE " +
           "w.weekStartDate <= :date AND w.weekEndDate >= :date AND " +
           "w.dayOfWeek = :dayOfWeek AND w.mealCategory = :category")
    List<WeeklyMenu> findWeeklyMenuItems(@Param("date") LocalDateTime date,
                                       @Param("dayOfWeek") DayOfWeek dayOfWeek,
                                       @Param("category") String category);
    */
	@Query("SELECT w FROM WeeklyMenu w WHERE " +
		       "w.weekStartDate <= :date AND w.weekEndDate >= :date AND " +
		       "w.dayOfWeek = :dayOfWeek AND " +
		       "(:category = '' OR w.mealCategory = :category)")
		List<WeeklyMenu> findWeeklyMenuItems(@Param("date") LocalDateTime date,
		                                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
		                                     @Param("category") String category);

	
    @Query("SELECT w FROM WeeklyMenu w WHERE " +
           "w.weekStartDate <= :endDate AND w.weekEndDate >= :startDate")
    List<WeeklyMenu> findWeeklyMenusBetweenDates(@Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
}