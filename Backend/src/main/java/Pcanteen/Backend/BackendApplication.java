package Pcanteen.Backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;
@EnableJpaAuditing
@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Create initial super admin if not exists
        if (employeeRepository.findByEmployeeId("superadmin").isEmpty()) {
            Employee superAdmin = new Employee();
            superAdmin.setEmployeeId("superadmin");
            superAdmin.setFirstName("Super");
            superAdmin.setLastName("Admin");
            superAdmin.setDepartment("Administration");
            superAdmin.setCustomerType("Employee"); // Set customer type
            superAdmin.setActive(true);
            superAdmin.setPassword(passwordEncoder.encode("superadmin123"));
            superAdmin.setAdmin(false);
            superAdmin.setSuperAdmin(true);
            employeeRepository.save(superAdmin);
        }
    }
}
