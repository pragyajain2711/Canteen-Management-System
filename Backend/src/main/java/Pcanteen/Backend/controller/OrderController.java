package Pcanteen.Backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import Pcanteen.Backend.dto.OrderRequest;
import Pcanteen.Backend.dto.OrderResponseDTO;
import Pcanteen.Backend.dto.PriceHistoryDTO;
import Pcanteen.Backend.model.Order;
import Pcanteen.Backend.Employee;
import Pcanteen.Backend.repository.*;
import Pcanteen.Backend.EmployeeRepository;
import Pcanteen.Backend.model.MenuItem;
import Pcanteen.Backend.service.OrderService;
import Pcanteen.Backend.service.TransactionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;
    private final TransactionService transactionService;
    private final EmployeeRepository employeeRepository;
    private final MenuItemRepository menuItemRepository;
    @Autowired
    public OrderController(OrderService orderService,
                         EmployeeRepository employeeRepository,
                         MenuItemRepository menuItemRepository,TransactionService transactionService) {
        this.orderService = orderService;
        this.employeeRepository = employeeRepository;
        this.menuItemRepository = menuItemRepository;
        this.transactionService= transactionService;
    }


  /*  @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Order order = new Order();
        
        // Get actual entities from repositories
        Employee employee = employeeRepository.findByEmployeeId(request.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        order.setEmployee(employee);
        
        MenuItem menuItem = menuItemRepository.findByMenuId(request.getMenuId())
            .orElseThrow(() -> new RuntimeException("Menu item not found"));
        order.setMenuItem(menuItem);
        
        // Set other fields
        order.setQuantity(request.getQuantity());
        order.setRemarks(request.getRemarks());
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        
        Order savedOrder = orderService.placeOrder(order, userDetails.getUsername());
        return ResponseEntity.ok(savedOrder);
    }*/
    
    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Employee employee = employeeRepository.findByEmployeeId(request.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        MenuItem menuItem = menuItemRepository.findByMenuId(request.getMenuId())
            .orElseThrow(() -> new RuntimeException("Menu item not found"));

        Order order = new Order();
        order.setEmployee(employee);
        order.setMenuItem(menuItem);
        order.setQuantity(request.getQuantity());
        order.setRemarks(request.getRemarks());
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        order.setStatus(request.getStatus());

        Order savedOrder = orderService.placeOrder(order, userDetails.getUsername());

        // ✅ Only for FastOrdering (status=DELIVERED)
        if ("DELIVERED".equalsIgnoreCase(request.getStatus())) {
            transactionService.createTransaction(savedOrder, "ACTIVE");
        }

        return ResponseEntity.ok(savedOrder);
    }

    
   @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Order>> getEmployeeOrders(
            @PathVariable String employeeId,
            @RequestParam(required = false) String status) {
        List<Order> orders = status == null ?
            orderService.getEmployeeOrders(employeeId) :
            orderService.getEmployeeOrdersByStatus(employeeId, status);
        return ResponseEntity.ok(orders);
    }
    
  /*  @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Order>> getEmployeeOrders(
            @PathVariable String employeeId,
            @RequestParam(required = false) String status) {
        
        logger.info("Fetching orders for employee {}", employeeId);
        
        try {
            List<Order> orders;
            if (status != null) {
                logger.info("Using status filter: {}", status);
                orders = orderService.getEmployeeOrdersByStatus(employeeId, status);
            } else {
                orders = orderService.getEmployeeOrders(employeeId);
            }
            
            logger.info("Found {} orders", orders.size());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error fetching orders", e);
            return ResponseEntity.internalServerError().build();
        }
    }*/

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(orderService.getOrdersBetweenDates(startDate, endDate));
        } else if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/history")
    public ResponseEntity<List<Order>> getOrderHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(orderService.getOrderHistory(startDate, endDate, department, category));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status, remarks));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        orderService.cancelOrder(orderId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

 
    
    // Add these new endpoints
    @GetMapping("/{orderId}/employee-details")
    public ResponseEntity<Employee> getOrderEmployeeDetails(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderEmployee(orderId));
    }
    
    @GetMapping("/{orderId}/menu-item-details")
    public ResponseEntity<MenuItem> getOrderMenuItemDetails(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderMenuItem(orderId));
    }
    
   @GetMapping("/{orderId}/price-history")
    public ResponseEntity<List<PriceHistoryDTO>> getOrderPriceHistory(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderPriceHistory(orderId));
    }
  
    
    // Enhance search to include business IDs
    @GetMapping("/search")
    public ResponseEntity<List<OrderResponseDTO>> searchOrders(
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String menuId,
            @RequestParam(required = false) String status) {
        
        return ResponseEntity.ok(orderService.searchOrders(term, employeeId, menuId, status));
    }
}
