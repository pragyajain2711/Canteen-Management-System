package Pcanteen.Backend.repository;


import  Pcanteen.Backend.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    // Find active items for a specific date
    @Query("SELECT m FROM MenuItem m WHERE m.startDate <= :date AND m.endDate >= :date")
    List<MenuItem> findActiveItemsOnDate(@Param("date") LocalDateTime date);
    
    // Find items by category active on a specific date
    @Query("SELECT m FROM MenuItem m WHERE m.category = :category AND m.startDate <= :date AND m.endDate >= :date")
    List<MenuItem> findActiveItemsByCategoryOnDate(@Param("category") String category, 
                                                 @Param("date") LocalDateTime date);
    
    // Find price history for a specific menu item (by name)
    /*@Query("SELECT m FROM MenuItem m WHERE m.name = :name ORDER BY m.startDate DESC")
    List<MenuItem> findPriceHistoryByName(@Param("name") String name);*/
    
 // Modify the existing query to include category filter
 // MenuItemRepository.java
    @Query("SELECT m FROM MenuItem m WHERE m.name = :name AND (:category IS NULL OR m.category = :category) ORDER BY m.createdAt DESC")
    List<MenuItem> findPriceHistoryByNameAndCategory(@Param("name") String name, 
                                                   @Param("category") String category);
    
    // Find items with filters
    @Query("SELECT m FROM MenuItem m WHERE " +
           "(:name IS NULL OR m.name LIKE %:name%) AND " +
           "(:category IS NULL OR m.category = :category) AND " +
           "(:startDate IS NULL OR m.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR m.endDate <= :endDate) AND " +
           "(:activeOnly IS NULL OR (:activeOnly = true AND m.isActive = true) OR (:activeOnly = false)) " +
           "ORDER BY m.name")
    List<MenuItem> findWithFilters(@Param("name") String name,
                                  @Param("category") String category,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  @Param("activeOnly") Boolean activeOnly);
    
    Optional<MenuItem> findByMenuId(String menuId);
    List<MenuItem> findByNameOrderByCreatedAtDesc(String name);

	List<MenuItem> findByName(String name);

    
}