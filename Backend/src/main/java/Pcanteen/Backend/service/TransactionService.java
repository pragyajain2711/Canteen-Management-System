package Pcanteen.Backend.service;

import Pcanteen.Backend.dto.*;
import Pcanteen.Backend.exception.ResourceNotFoundException;
import Pcanteen.Backend.model.*;
import Pcanteen.Backend.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository,
                            OrderRepository orderRepository,
                            ModelMapper modelMapper) {
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public void createTransactionsForDeliveredOrders() {
        List<Order> deliveredOrders = orderRepository.findByStatus("DELIVERED");
        for (Order order : deliveredOrders) {
            if (!transactionRepository.existsByOrderId(order.getId())) {
                createTransaction(order, "ACTIVE");
            }
        }
    }

    @Transactional
    public void createTransactionsForCancelledOrders() {
        List<Order> cancelledOrders = orderRepository.findByStatus("CANCELLED");
        for (Order order : cancelledOrders) {
            if (!transactionRepository.existsByOrderId(order.getId())) {
                createTransaction(order, "INACTIVE");
            }
        }
    }

    private void createTransaction(Order order, String status) {
        Transaction transaction = new Transaction();
        transaction.setTransactionId("TXN-" + System.currentTimeMillis());
        transaction.setOrder(order);
        transaction.setEmployee(order.getEmployee());
        transaction.setMenuItem(order.getMenuItem());
        transaction.setQuantity(order.getQuantity());
        transaction.setUnitPrice(order.getPriceAtOrder());
        transaction.setTotalPrice(order.getTotalPrice());
        transaction.setStatus(status);
        transaction.setCreatedBy("SYSTEM");
        transactionRepository.save(transaction);
    }

    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAllWithAssociations().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TransactionDTO addRemark(Long transactionId, String remark, String user) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        
        transaction.addRemark(remark, user);
        Transaction updated = transactionRepository.save(transaction);
        return convertToDTO(updated);
    }

    public TransactionDTO addResponse(Long transactionId, String response, String user) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        
        transaction.addResponse(response, user);
        Transaction updated = transactionRepository.save(transaction);
        return convertToDTO(updated);
    }

    public TransactionDTO updateStatus(Long transactionId, String status, String user) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        
        transaction.setStatus(status);
        transaction.setUpdatedBy(user);
        Transaction updated = transactionRepository.save(transaction);
        return convertToDTO(updated);
    }
    
    public List<Object[]> getAllEmployeeIdsAndNames() {
        return transactionRepository.findAllEmployeeIdsAndNames();
    }

    public BillDTO generateBill(BillRequest request, String user) {
        List<Transaction> transactions = transactionRepository.findBillableTransactions(
                request.getEmployeeId(), 
                request.getMonth(), 
                request.getYear());
        
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("No billable transactions found");
        }
        
        BillDTO bill = new BillDTO();
        bill.setEmployeeId(request.getEmployeeId());
        bill.setEmployeeName(transactions.get(0).getEmployee().getFullName());
        bill.setMonth(request.getMonth());
        bill.setYear(request.getYear());
        bill.setTotalAmount(transactions.stream()
                .mapToDouble(Transaction::getTotalPrice)
                .sum());
        bill.setTransactions(transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
        
        return bill;
    }

    public TransactionDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return convertToDTO(transaction);
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        TransactionDTO dto = new TransactionDTO();
        // Map basic fields
        dto.setId(transaction.getId());
        dto.setTransactionId(transaction.getTransactionId());
        dto.setQuantity(transaction.getQuantity());
        dto.setUnitPrice(transaction.getUnitPrice());
        dto.setTotalPrice(transaction.getTotalPrice());
        dto.setStatus(transaction.getStatus());
        dto.setRemarks(transaction.getRemarks());
        dto.setResponses(transaction.getResponses());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setCreatedBy(transaction.getCreatedBy());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        dto.setUpdatedBy(transaction.getUpdatedBy());

        // Map relationships with null checks
        if (transaction.getOrder() != null) {
            dto.setOrderBusinessId(transaction.getOrder().getId().toString());
        }
        
        if (transaction.getMenuItem() != null) {
            dto.setMenuBusinessId(transaction.getMenuItem().getMenuId());
            dto.setMenuItemName(transaction.getMenuItem().getName());
            dto.setCategory(transaction.getMenuItem().getCategory());
        }
        
        if (transaction.getEmployee() != null) {
            dto.setEmployeeBusinessId(transaction.getEmployee().getEmployeeId());
            dto.setEmployeeName(transaction.getEmployee().getFullName());
        }
        
        return dto;
    }
    
    public List<TransactionDTO> findByMenuBusinessId(String menuBusinessId) {
        List<Transaction> transactions = transactionRepository.findByMenuBusinessId(menuBusinessId);
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("No transactions found for menu ID: " + menuBusinessId);
        }
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> findByEmployeeBusinessId(String employeeBusinessId) {
        List<Transaction> transactions = transactionRepository.findByEmployeeBusinessId(employeeBusinessId);
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("No transactions found for employee ID: " + employeeBusinessId);
        }
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransactionDTO> getBillableTransactions(String employeeId, int month, int year) {
        List<Transaction> transactions = transactionRepository.findBillableTransactions(employeeId, month, year);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


}