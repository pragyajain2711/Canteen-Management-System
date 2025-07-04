package Pcanteen.Backend.controller;

import Pcanteen.Backend.dto.*;
import Pcanteen.Backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }
    
    @GetMapping("/billable")
    public ResponseEntity<List<TransactionDTO>> getBillableTransactions(
            @RequestParam String employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        List<TransactionDTO> transactions = transactionService.getBillableTransactions(employeeId, month, year);
        return ResponseEntity.ok(transactions);
    }


    
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @GetMapping("/menu/{menuBusinessId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByMenuId(
            @PathVariable String menuBusinessId) {
        return ResponseEntity.ok(transactionService.findByMenuBusinessId(menuBusinessId));
    }

    @GetMapping("/employee/{employeeBusinessId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByEmployeeId(
            @PathVariable String employeeBusinessId) {
        return ResponseEntity.ok(transactionService.findByEmployeeBusinessId(employeeBusinessId));
    }

    @PostMapping("/remark")
    public ResponseEntity<TransactionDTO> addRemark(
            @RequestParam Long transactionId,
            @RequestParam String remark,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                transactionService.addRemark(transactionId, remark, userDetails.getUsername()));
    }

    @PostMapping("/response")
    public ResponseEntity<TransactionDTO> addResponse(
            @RequestParam Long transactionId,
            @RequestParam String response,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                transactionService.addResponse(transactionId, response, userDetails.getUsername()));
    }

    @PostMapping("/status")
    public ResponseEntity<TransactionDTO> updateStatus(
            @RequestParam Long transactionId,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                transactionService.updateStatus(transactionId, status, userDetails.getUsername()));
    }

    @PostMapping("/generate-bill")
    public ResponseEntity<BillDTO> generateBill(
            @RequestBody BillRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.generateBill(request, userDetails.getUsername()));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, String>>> getAllEmployeeIdsAndNames() {
        List<Object[]> results = transactionService.getAllEmployeeIdsAndNames();
        List<Map<String, String>> employees = results.stream()
            .map(row -> {
                Map<String, String> emp = new HashMap<>();
                emp.put("employeeId", (String) row[0]);
                emp.put("fullName", row[1] + " " + row[2]);
                return emp;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }

    @PostMapping("/create-transactions")
    public ResponseEntity<String> createTransactions() {
        transactionService.createTransactionsForDeliveredOrders();
        transactionService.createTransactionsForCancelledOrders();
        return ResponseEntity.ok("Transactions created successfully");
    }
}