package Pcanteen.Backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByRecipientId(String recipientId);
    List<Feedback> findByRecipientIdAndIsReadFalse(String recipientId);
    List<Feedback> findByType(Feedback.FeedbackType type);
    List<Feedback> findByTypeAndStatus(Feedback.FeedbackType type, String status);
    List<Feedback> findBySenderId(String senderId);
   // void deleteByRecipientId(String recipientId);  // Added this method

}