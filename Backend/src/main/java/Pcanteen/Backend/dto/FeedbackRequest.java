package Pcanteen.Backend.dto;

public class FeedbackRequest {
    private String title;
    private String content;
    private String senderId;
    private String recipientId; // Only required for notifications
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getSenderId() {
		return senderId;
	}
	public void setSenderId(String senderId) {
		this.senderId = senderId;
	}
	public String getRecipientId() {
		return recipientId;
	}
	public void setRecipientId(String recipientId) {
		this.recipientId = recipientId;
	}
	public FeedbackRequest() {
		super();
		// TODO Auto-generated constructor stub
	}

    // Getters and Setters
    
}
