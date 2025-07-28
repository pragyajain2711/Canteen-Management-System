package Pcanteen.Backend.dto;

import java.time.LocalDate;

public class OrderRequest {
    //private Long menuItemId;
    //private Long employeeId;
	 private String employeeId; 
	 private String menuId;
    private Integer quantity;
    private String remarks;
    private LocalDate expectedDeliveryDate;
private String status;
    
    

    public String getStatus() {
	return status;
}

public void setStatus(String status) {
	this.status = status;
}

	// Getters and Setters
    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getMenuId() {
        return menuId;
    }

    public void setMenuId(String menuId) {
        this.menuId = menuId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

	
    

}