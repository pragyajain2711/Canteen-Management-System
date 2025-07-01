package Pcanteen.Backend.repository;

import Pcanteen.Backend.model.Order;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import Pcanteen.Backend.Employee;
import Pcanteen.Backend.dto.OrderResponseDTO;
import Pcanteen.Backend.enums.OrderStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> , JpaSpecificationExecutor<Order>{
	
    // Basic queries using relationships
    List<Order> findByEmployee(Employee employee);
    List<Order> findByStatus(String status);
    List<Order> findByEmployeeAndStatus(Employee employee, String status);
   /* @Query("SELECT o FROM Order o WHERE o.employee.employeeId = :employeeId")
    List<Order> findByEmployeeId(@Param("employeeId") String employeeId);

    @Query("SELECT o FROM Order o WHERE o.employee.employeeId = :employeeId AND o.status IN :statuses")
    List<Order> findByEmployeeIdAndStatusIn(
        @Param("employeeId") String employeeId,
        @Param("statuses") List<String> statuses);*/
    
    @EntityGraph(attributePaths = {"employee", "menuItem"})
    Optional<Order> findWithAssociationsById(Long id);
    
    // Date range query
    @Query("SELECT o FROM Order o WHERE o.expectedDeliveryDate BETWEEN :startDate AND :endDate")
    List<Order> findByExpectedDeliveryDateBetween(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
        
    @Query("SELECT new Pcanteen.Backend.dto.OrderResponseDTO(" +
    	       "o.id, o.status, o.totalPrice, o.orderTime, o.expectedDeliveryDate, " +
    	       "o.remarks, CONCAT(e.firstName, ' ', e.lastName), m.name, e.employeeId, m.menuId) " +
    	       "FROM Order o " +
    	       "JOIN o.employee e " +
    	       "JOIN o.menuItem m " +
    	       "WHERE o.remarks LIKE %:term% OR m.name LIKE %:term% OR " +
    	       "CONCAT(e.firstName, ' ', e.lastName) LIKE %:term% OR " +
    	       "e.employeeId LIKE %:term% OR m.menuId LIKE %:term%")
    	List<OrderResponseDTO> searchOrders(@Param("term") String term);
    

  
    
    // History query with filters
    @Query("SELECT o FROM Order o " +
           "WHERE (:startDate IS NULL OR o.expectedDeliveryDate >= :startDate) AND " +
           "(:endDate IS NULL OR o.expectedDeliveryDate <= :endDate) AND " +
           "(:department IS NULL OR o.employee.department = :department) AND " +
           "(:category IS NULL OR o.menuItem.category = :category) AND " +
           "o.status IN ('DELIVERED', 'CANCELLED')")
    List<Order> findHistoryOrders(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("department") String department,
        @Param("category") String category);
}

