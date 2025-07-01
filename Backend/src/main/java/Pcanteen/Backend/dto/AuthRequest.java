/*package Pcanteen.Backend.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotBlank(message = "Password is required")
    private String password;
}
*/
package Pcanteen.Backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
private String employeeId;
private String password;

public String getEmployeeId() {
	return employeeId;
}
public void setEmployeeId(String employeeId) {
	this.employeeId = employeeId;
}
public String getPassword() {
	return password;
}
public void setPassword(String password) {
	this.password = password;
}
public AuthRequest(String employeeId, String password) {
	super();
	this.employeeId = employeeId;
	this.password = password;
}
public AuthRequest() {
	super();
	// TODO Auto-generated constructor stub
}


}


