package Pcanteen.Backend.service;

import Pcanteen.Backend.model.MenuItem;
import Pcanteen.Backend.model.Order;
import Pcanteen.Backend.repository.MenuItemRepository;
import Pcanteen.Backend.repository.OrderRepository;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import Pcanteen.Backend.Employee;
import Pcanteen.Backend.EmployeeRepository;
import Pcanteen.Backend.dto.OrderResponseDTO;
import Pcanteen.Backend.dto.PriceHistoryDTO;
import Pcanteen.Backend.enums.OrderStatus;
import Pcanteen.Backend.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final EmployeeRepository employeeRepository;
    private final MenuItemService menuItemService;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

 
    @Autowired
    public OrderService(OrderRepository orderRepository, MenuItemRepository menuItemRepository,
			EmployeeRepository employeeRepository, MenuItemService menuItemService) {
		super();
		this.orderRepository = orderRepository;
		this.menuItemRepository = menuItemRepository;
		this.employeeRepository = employeeRepository;
		this.menuItemService = menuItemService;
	}

	@Transactional
    public Order placeOrder(Order order, String currentUser) {
		System.out.println("Received order with status: " + order.getStatus());
    	// Find by business IDs
        Employee employee = employeeRepository.findByEmployeeId(order.getEmployee().getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        MenuItem menuItem = menuItemRepository.findByMenuId(order.getMenuItem().getMenuId())
            .orElseThrow(() -> new RuntimeException("Menu item not found"));

        order.setEmployee(employee);
        order.setMenuItem(menuItem);
        
        // Calculate prices
        order.setPriceAtOrder(menuItem.getPrice());
        order.setTotalPrice(menuItem.getPrice() * order.getQuantity());
        
        // Set timestamps
        order.setOrderTime(LocalDateTime.now());
        
     // Only set PENDING if status wasn't provided or is empty
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("PENDING");
        }
        order.setCreatedBy(currentUser);
        
        // Set default delivery date if not provided
        if (order.getExpectedDeliveryDate() == null) {
            order.setExpectedDeliveryDate(LocalDate.now());
        }
        
        return orderRepository.save(order);
    }
    
    

   public List<Order> getEmployeeOrders(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        return orderRepository.findByEmployee(employee);
    }
  

	/*public List<Order> getEmployeeOrders(String employeeId) {
	    return orderRepository.findByEmployeeId(employeeId);
	}

	public List<Order> getEmployeeOrdersByStatus(String employeeId, String status) {
	    List<String> statusList = Arrays.asList(status.split(","));
	    return orderRepository.findByEmployeeIdAndStatusIn(employeeId, statusList);
	}*/

   public List<Order> getEmployeeOrdersByStatus(String employeeId, String status) {
       Employee employee = employeeRepository.findByEmployeeId(employeeId)
           .orElseThrow(() -> new RuntimeException("Employee not found"));
       return orderRepository.findByEmployeeAndStatus(employee, status);
   }
   
   

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersBetweenDates(LocalDate startDate, LocalDate endDate) {
        return orderRepository.findByExpectedDeliveryDateBetween(startDate, endDate);
    }

 
 // In OrderService.java
    public List<OrderResponseDTO> searchOrders(String term, String employeeId, String menuId, String status) {
        if (term != null) {
            return orderRepository.searchOrders(term);
        }
        
        // Build dynamic query based on parameters
        Specification<Order> spec = Specification.where(null);
        
        if (employeeId != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("employee").get("employeeId"), employeeId));
        }
        
        if (menuId != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("menuItem").get("menuId"), menuId));
        }
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("status"), status));
        }
        
        return orderRepository.findAll(spec).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private OrderResponseDTO convertToDTO(Order order) {
        return new OrderResponseDTO(
            order.getId(),
            order.getStatus(),
            order.getTotalPrice(),
            order.getOrderTime(),
            order.getExpectedDeliveryDate(),
            order.getRemarks(),
            order.getEmployee().getFullName(),
            order.getMenuItem().getName(),
            order.getEmployee().getEmployeeId(),  // Business ID
            order.getMenuItem().getMenuId()       // Business ID
        );
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrderHistory(LocalDate startDate, LocalDate endDate, 
                                      String department, String category) {
        return orderRepository.findHistoryOrders(startDate, endDate, department, category);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus, String remarks) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(newStatus);
        if (remarks != null) {
            order.setRemarks(remarks);
        }
        
        return orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId, String employeeId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify employee authorization
        if (!order.getEmployee().getEmployeeId().equals(employeeId)) {
            throw new RuntimeException("Not authorized to cancel this order");
        }
        
        // Verify cancellation window (5 minutes)
        if (ChronoUnit.MINUTES.between(order.getOrderTime(), LocalDateTime.now()) > 5) {
            throw new RuntimeException("Cancellation window expired (5 minutes)");
        }
        
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }
    
    public Order getOrderWithDetails(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public Employee getOrderEmployee(Long orderId) {
        Order order = getOrderWithDetails(orderId);
        return order.getEmployee();
    }
    
    public MenuItem getOrderMenuItem(Long orderId) {
        Order order = getOrderWithDetails(orderId);
        return order.getMenuItem();
    }
    
   /* public List<PriceHistoryDTO> getOrderPriceHistory(Long orderId) {
        Order order = getOrderWithDetails(orderId);
        return menuItemService.getPriceHistory(order.getMenuItem().getName());
    }*/
    public List<PriceHistoryDTO> getOrderPriceHistory(Long orderId) {
        Order order = getOrderWithDetails(orderId);
        return menuItemService.getPriceHistory(
            order.getMenuItem().getName(),
            order.getMenuItem().getCategory()
        );
    }
    
}