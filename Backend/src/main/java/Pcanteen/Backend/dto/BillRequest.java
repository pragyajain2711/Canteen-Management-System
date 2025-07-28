package Pcanteen.Backend.dto;

import lombok.Data;

@Data
public class BillRequest {
    private String employeeId; // Matches your Employee entity
    private Integer month;
    private Integer year;
	public String getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}
	public Integer getMonth() {
		return month;
	}
	public void setMonth(Integer month) {
		this.month = month;
	}
	public Integer getYear() {
		return year;
	}
	public void setYear(Integer year) {
		this.year = year;
	}
	public BillRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public BillRequest(String employeeId, Integer month, Integer year) {
		super();
		this.employeeId = employeeId;
		this.month = month;
		this.year = year;
	}
    
}
