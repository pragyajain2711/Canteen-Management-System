package Pcanteen.Backend;


import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

import Pcanteen.Backend.model.MenuItem;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
	Optional<Employee> findByMobileNumber(String mobileNumber);
	List<Employee> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Employee> findByCreatedAtAfter(LocalDateTime date);
    List<Employee> findByCreatedAtBefore(LocalDateTime date);
    //List<Employee> findBySuperAdminFalse();
	Optional<MenuItem> findByEmployeeId(Employee employee);
	
}