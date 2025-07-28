package Pcanteen.Backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    public enum FeedbackType {
        NOTIFICATION,
        SUGGESTION,
        COMPLAINT
    }
    
    public enum FeedbackStatus {
        PENDING,    // For suggestions/complaints
        RESOLVED,   // For suggestions/complaints
        SENT,       // For notifications
        READ        // For notifications
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private FeedbackType type;

    private String title;
    private String content;
    private String senderId;
    private String senderName;
    private String recipientId;
    private boolean isRead;
    private String response;
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "response_at")
    private LocalDateTime responseAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public FeedbackType getType() {
		return type;
	}

	public void setType(FeedbackType type) {
		this.type = type;
	}

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

	public String getSenderName() {
		return senderName;
	}

	public void setSenderName(String senderName) {
		this.senderName = senderName;
	}

	public String getRecipientId() {
		return recipientId;
	}

	public void setRecipientId(String recipientId) {
		this.recipientId = recipientId;
	}

	public boolean isRead() {
		return isRead;
	}

	public void setRead(boolean isRead) {
		this.isRead = isRead;
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

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getResponseAt() {
		return responseAt;
	}

	public void setResponseAt(LocalDateTime responseAt) {
		this.responseAt = responseAt;
	}

	public Feedback() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Feedback(Long id, FeedbackType type, String title, String content, String senderId, String senderName,
			String recipientId, boolean isRead, String response, String status, LocalDateTime createdAt,
			LocalDateTime responseAt) {
		super();
		this.id = id;
		this.type = type;
		this.title = title;
		this.content = content;
		this.senderId = senderId;
		this.senderName = senderName;
		this.recipientId = recipientId;
		this.isRead = isRead;
		this.response = response;
		this.status = status;
		this.createdAt = createdAt;
		this.responseAt = responseAt;
	}

    
}