package Pcanteen.Backend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "employee")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
    
  //  @Column(name = "full_name", nullable = false)
    //private String fullName;
 // Add these new fields to your Employee class
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "customer_type", nullable = false)
    private String customerType;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Add getters and setters for these new fields
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
    
    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;
    
    
    @Column(nullable = false)
    private String department;
    
    @Column(name = "mobile_number")
    private String mobileNumber;
    
    
    @Column(nullable = false)
    private String password;
    
    @Transient
    private String confirmPassword;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
 /*   @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; */
    
    @Column(name = "reset_password_otp")
    private String resetPasswordOtp;

    @Column(name = "reset_password_otp_expiry")
    private LocalDateTime resetPasswordOtpExpiry;
    
    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin = false;
    
    @Column(name = "is_super_admin", nullable = false)
    private boolean isSuperAdmin = false;
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
 
    
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

	public Employee() {
    }

	
	public String getResetPasswordOtp() {
		return resetPasswordOtp;
	}


	public void setResetPasswordOtp(String resetPasswordOtp) {
		this.resetPasswordOtp = resetPasswordOtp;
	}


	public Employee(Long id, String firstName, String lastName, String customerType, boolean isActive, String employeeId,
		String department, String mobileNumber, String password, String confirmPassword, LocalDateTime createdAt,
		String resetPasswordOtp, LocalDateTime resetPasswordOtpExpiry, boolean isAdmin, boolean isSuperAdmin) {
	super();
	this.id = id;
	this.firstName = firstName;
	this.lastName = lastName;
	this.customerType = customerType;
	this.isActive = isActive;
	this.employeeId = employeeId;
	this.department = department;
	this.mobileNumber = mobileNumber;
	this.password = password;
	this.confirmPassword = confirmPassword;
	this.createdAt = createdAt;
	this.resetPasswordOtp = resetPasswordOtp;
	this.resetPasswordOtpExpiry = resetPasswordOtpExpiry;
	this.isAdmin = isAdmin;
	this.isSuperAdmin = isSuperAdmin;
}

	public LocalDateTime getResetPasswordOtpExpiry() {
		return resetPasswordOtpExpiry;
	}


	public void setResetPasswordOtpExpiry(LocalDateTime resetPasswordOtpExpiry) {
		this.resetPasswordOtpExpiry = resetPasswordOtpExpiry;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}

/*
	public String getFullName() {
		return fullName;
	}


	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
*/

	public String getEmployeeId() {
		return employeeId;
	}


	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}


	public String getDepartment() {
		return department;
	}


	public void setDepartment(String department) {
		this.department = department;
	}


	public String getMobileNumber() {
		return mobileNumber;
	}


	public void setMobileNumber(String mobileNumber) {
		this.mobileNumber = mobileNumber;
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


	public LocalDateTime getCreatedAt() {
		return createdAt;
	}


	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
    
    
    
    
}
