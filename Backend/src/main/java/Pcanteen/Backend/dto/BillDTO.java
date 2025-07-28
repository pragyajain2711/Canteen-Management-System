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
    
    // Status count fields
    private long activeCount;
    private long generatedCount;
    private long paidCount;
    private long inactiveCount;
    private long modifiedCount;

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
    
    // Getters and setters for status counts
    public long getActiveCount() {
        return activeCount;
    }
    public void setActiveCount(long activeCount) {
        this.activeCount = activeCount;
    }
    public long getGeneratedCount() {
        return generatedCount;
    }
    public void setGeneratedCount(long generatedCount) {
        this.generatedCount = generatedCount;
    }
    public long getPaidCount() {
        return paidCount;
    }
    public void setPaidCount(long paidCount) {
        this.paidCount = paidCount;
    }
    public long getInactiveCount() {
        return inactiveCount;
    }
    public void setInactiveCount(long inactiveCount) {
        this.inactiveCount = inactiveCount;
    }
    public long getModifiedCount() {
        return modifiedCount;
    }
    public void setModifiedCount(long modifiedCount) {
        this.modifiedCount = modifiedCount;
    }

    public BillDTO(String employeeId, String employeeName, Integer month, Integer year, 
                  Double totalAmount, List<TransactionDTO> transactions) {
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
    }
}