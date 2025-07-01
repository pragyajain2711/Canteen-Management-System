
package Pcanteen.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String employeeId;
    private String token;
    private String firstName;
    private String lastName;
    private String department;
    private String customerType;
    private boolean isActive;
    private boolean isAdmin;
    private boolean isSuperAdmin;

    // Getters and setters (lombok @Data will generate these, but explicitly showing for clarity)
    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public boolean isSuperAdmin() {
        return isSuperAdmin;
    }

    public void setSuperAdmin(boolean isSuperAdmin) {
        this.isSuperAdmin = isSuperAdmin;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    // Constructor with all fields
    public AuthResponse(String employeeId, String token, String firstName, String lastName, 
                      String department, String customerType, boolean isActive, 
                      boolean isAdmin, boolean isSuperAdmin) {
        this.employeeId = employeeId;
        this.token = token;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.customerType = customerType;
        this.isActive = isActive;
        this.isAdmin = isAdmin;
        this.isSuperAdmin = isSuperAdmin;
    }

    public AuthResponse() {
		super();
		// TODO Auto-generated constructor stub
	}

	// Helper method to get full name (combines first and last name)
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
