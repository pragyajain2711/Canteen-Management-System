
package Pcanteen.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor


public class SignUpRequest {
    private String firstName;
    private String lastName;
    private String department;
    private String employeeId;
    private String password;
    private String confirmPassword;
    private String mobileNumber;
    private String customerType;
    private boolean isActive;
    
    
    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
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
	public String getConfirmPassword() {
		return confirmPassword;
	}
	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}
	public String getMobileNumber() {
		return mobileNumber;
	}
	public void setMobileNumber(String mobileNumber) {
		this.mobileNumber = mobileNumber;
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
	public SignUpRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SignUpRequest(String firstName, String lastName, String department, String employeeId, String password,
			String confirmPassword, String mobileNumber, String customerType, boolean isActive) {
		super();
		this.firstName = firstName;
		this.lastName = lastName;
		this.department = department;
		this.employeeId = employeeId;
		this.password = password;
		this.confirmPassword = confirmPassword;
		this.mobileNumber = mobileNumber;
		this.customerType = customerType;
		this.isActive = isActive;
	}
	@Override
	public String toString() {
		return "SignUpRequest [firstName=" + firstName + ", lastName=" + lastName + ", department=" + department
				+ ", employeeId=" + employeeId + ", password=" + password + ", confirmPassword=" + confirmPassword
				+ ", mobileNumber=" + mobileNumber + ", customerType=" + customerType + ", isActive=" + isActive + "]";
	}
    
    
}