package Pcanteen.Backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BillDTO {
    private String employeeId;
    private String employeeName;
    private Integer month;
    private Integer year;
    private Double totalAmount;
    private List<TransactionDTO> transactions;
	public String getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}
	public String getEmployeeName() {
		return employeeName;
	}
	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
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
	public Double getTotalAmount() {
		return totalAmount;
	}
	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}
	public List<TransactionDTO> getTransactions() {
		return transactions;
	}
	public void setTransactions(List<TransactionDTO> transactions) {
		this.transactions = transactions;
	}
	public BillDTO(String employeeId, String employeeName, Integer month, Integer year, Double totalAmount,
			List<TransactionDTO> transactions) {
		super();
		this.employeeId = employeeId;
		this.employeeName = employeeName;
		this.month = month;
		this.year = year;
		this.totalAmount = totalAmount;
		this.transactions = transactions;
	}
	public BillDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
}