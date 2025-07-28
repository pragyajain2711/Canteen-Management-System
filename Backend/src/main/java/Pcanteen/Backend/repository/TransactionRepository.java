package Pcanteen.Backend.repository;

import Pcanteen.Backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    boolean existsByOrderId(Long orderId);
    
    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.order o " +
           "LEFT JOIN FETCH t.menuItem m " +
           "LEFT JOIN FETCH t.employee e")
    List<Transaction> findAllWithAssociations();
    
    @Query("SELECT t FROM Transaction t " +
    	       "LEFT JOIN FETCH t.order o " +
    	       "LEFT JOIN FETCH t.menuItem m " +
    	       "LEFT JOIN FETCH t.employee e " +
    	       "WHERE t.id = :id")
    	Optional<Transaction> findByIdWithAssociations(@Param("id") Long id);

    	
    
   /* @Query("SELECT t FROM Transaction t WHERE " +
           "(:employeeId IS NULL OR t.employee.employeeId = :employeeId) AND " +
           "(:month IS NULL OR MONTH(t.createdAt) = :month) AND " +
           "(:year IS NULL OR YEAR(t.createdAt) = :year) AND " +
           "t.status IN ('ACTIVE', 'INACTIVE')")
    List<Transaction> findBillableTransactions(
            @Param("employeeId") String employeeId,
            @Param("month") Integer month,
            @Param("year") Integer year);*/

    @Query("SELECT DISTINCT e.employeeId, e.firstName, e.lastName FROM Transaction t JOIN t.employee e")
    List<Object[]> findAllEmployeeIdsAndNames();
    
    @Query("SELECT t FROM Transaction t JOIN t.menuItem m WHERE m.menuId = :menuBusinessId")
    List<Transaction> findByMenuBusinessId(@Param("menuBusinessId") String menuBusinessId);
    
    @Query("SELECT t FROM Transaction t JOIN t.employee e WHERE e.employeeId = :employeeBusinessId")
    List<Transaction> findByEmployeeBusinessId(@Param("employeeBusinessId") String employeeBusinessId);
    
   // List<Transaction> findBillableTransactions(Long employeeId, int month, int year);
    // Modified getBillableTransactions in repository
    @Query("SELECT t FROM Transaction t WHERE " +
    	       "t.employee.employeeId = :employeeId AND " +
    	       "(:month IS NULL OR MONTH(t.createdAt) = :month) AND " +
    	       "(:year IS NULL OR YEAR(t.createdAt) = :year)")
    	List<Transaction> findBillableTransactions(
    	    @Param("employeeId") String employeeId,
    	    @Param("month") Integer month,
    	    @Param("year") Integer year);
}