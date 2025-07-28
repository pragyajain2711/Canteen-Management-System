package Pcanteen.Backend.dto;

import lombok.Data;

@Data
public class TransactionRequest {
    private Long orderId; // Matches your Order entity ID type
    private String remark;
    private String response;
    private String status;
	public Long getOrderId() {
		return orderId;
	}
	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
	public String getResponse() {
		return response;
	}
	public void setResponse(String response) {
		this.response = response;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public TransactionRequest(Long orderId, String remark, String response, String status) {
		super();
		this.orderId = orderId;
		this.remark = remark;
		this.response = response;
		this.status = status;
	}
	public TransactionRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
    
}
