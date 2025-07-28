package Pcanteen.Backend;


import Pcanteen.Backend.dto.AuthRequest;
import Pcanteen.Backend.dto.ResetPasswordRequest;
import Pcanteen.Backend.EmailService;
import Pcanteen.Backend.dto.AuthResponse;
import Pcanteen.Backend.dto.SignUpRequest;
import Pcanteen.Backend.exception.CustomException;
import Pcanteen.Backend.Employee;
import Pcanteen.Backend.EmployeeRepository;
import Pcanteen.Backend.security.CustomUserDetailsService;
import Pcanteen.Backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService; 
    @Autowired
    public AuthController(AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService,
			JwtUtil jwtUtil, PasswordEncoder passwordEncoder, EmployeeRepository employeeRepository,
			EmailService emailService) {
		super();
		this.authenticationManager = authenticationManager;
		this.userDetailsService = userDetailsService;
		this.jwtUtil = jwtUtil;
		this.passwordEncoder = passwordEncoder;
		this.employeeRepository = employeeRepository;
		this.emailService = emailService;
	}
    /*
    public AuthController(AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService,
			JwtUtil jwtUtil, PasswordEncoder passwordEncoder, EmployeeRepository employeeRepository, SmsService smsService) {
		super();
		this.authenticationManager = authenticationManager;
		this.userDetailsService = userDetailsService;
		this.jwtUtil = jwtUtil;
		this.passwordEncoder = passwordEncoder;
		this.employeeRepository = employeeRepository;
		this.smsService=smsService;
	}*/

	@PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmployeeId(), authRequest.getPassword())
            );
        } catch (Exception e) {
            throw new CustomException("Invalid employee ID or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmployeeId());
        final String token = jwtUtil.generateToken(userDetails);
        
        Employee employee = employeeRepository.findByEmployeeId(authRequest.getEmployeeId())
                .orElseThrow(() -> new CustomException("Employee not found"));

        return ResponseEntity.ok(new AuthResponse(
                employee.getEmployeeId(),
                token,
                employee.getFirstName(),       
                employee.getLastName(),
                employee.getDepartment(),
                employee.getCustomerType(),     
                employee.isActive(),
                employee.isAdmin(),
                employee.isSuperAdmin()
        ));
    }

  

	@PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest signUpRequest) {
        if (employeeRepository.existsByEmployeeId(signUpRequest.getEmployeeId())) {
            throw new CustomException("Employee ID is already in use");
        }

        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            throw new CustomException("Passwords do not match");
        }

        Employee employee = new Employee();
       // employee.setFullName(signUpRequest.getFullName());
        employee.setFirstName(signUpRequest.getFirstName());
        employee.setLastName(signUpRequest.getLastName());
        employee.setDepartment(signUpRequest.getDepartment());
        employee.setEmployeeId(signUpRequest.getEmployeeId());
        employee.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        employee.setCustomerType(signUpRequest.getCustomerType());
        employee.setActive(signUpRequest.isActive());
        //employee.setMobileNumber(signUpRequest.getMobileNumber());
        String rawNumber = signUpRequest.getMobileNumber();
        String normalizedNumber = rawNumber.startsWith("+91") ? rawNumber : "+91" + rawNumber;
        employee.setMobileNumber(normalizedNumber);

        employeeRepository.save(employee);

        return ResponseEntity.ok("Employee registered successfully");
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String mobileNumber,@RequestParam String email) {
    	try{String formattedNumber = mobileNumber.startsWith("+91") 
    	        ? mobileNumber 
    	        : "+91" + mobileNumber;
    	Employee employee = employeeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new CustomException("No account found with this mobile number"));
        
        // Generate OTP
        String otp = generateOtp();
        employee.setResetPasswordOtp(otp);
        employee.setResetPasswordOtpExpiry(LocalDateTime.now().plusMinutes(15));
        employeeRepository.save(employee);
        
        // Send SMS with OTP
       /* smsService.sendSms(employee.getMobileNumber(), 
            "Your password reset OTP is: " + otp + ". Valid for 15 minutes.");
        
        return ResponseEntity.ok("OTP sent to registered mobile number");}*/
        emailService.sendOtpEmail(
                email, // Use the provided email, not employee.getEmail()
                "Password Reset OTP",
                "Your OTP is: " + otp + ". Valid for 15 minutes."
            );
        return ResponseEntity.ok("OTP sent to registered email");
        }
    	catch (CustomException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual cause
            return ResponseEntity.status(500).body("Internal error: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
       try { Employee employee = employeeRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new CustomException("No account found with this mobile number"));
        
        // Validate OTP
        if (!request.getOtp().equals(employee.getResetPasswordOtp())) {
            throw new CustomException("Invalid OTP");
        }
        
        if (LocalDateTime.now().isAfter(employee.getResetPasswordOtpExpiry())) {
            throw new CustomException("OTP expired");
        }
        /*
        // Update password
        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employee.setResetPasswordOtp(null);
        employee.setResetPasswordOtpExpiry(null);
        employeeRepository.save(employee);
        
        // Send confirmation SMS
        emailService.sendOtpEmail(employee.getMobileNumber(),
            "Your password has been reset successfully at " + LocalDateTime.now());
        
        return ResponseEntity.ok("Password updated successfully");*/
     // Update password
        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        
        // Send confirmation to the same email used for OTP
        /*emailService.sendOtpEmail(
            employee.getTempEmail(), // Use the temporarily stored email
            "Password Reset Confirmation",
            "Your password has been reset successfully at " + LocalDateTime.now()
        );*/
        emailService.sendPasswordResetConfirmation(request.getEmail());
        
        // Clear OTP and temp email fields
        employee.setResetPasswordOtp(null);
        employee.setResetPasswordOtpExpiry(null);
        //employee.setTempEmail(null);
        employeeRepository.save(employee);
        
        return ResponseEntity.ok("Password updated successfully");}
       catch (CustomException e) {
           return ResponseEntity.badRequest().body(e.getMessage());
       } catch (Exception e) {
           e.printStackTrace(); // Log the actual cause
           return ResponseEntity.status(500).body("Internal error: " + e.getMessage());
       }
    }

    private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP
    }
}