package Pcanteen.Backend.controller;

import Pcanteen.Backend.dto.*;
import Pcanteen.Backend.service.MenuItemService;
import Pcanteen.Backend.service.WeeklyMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import Pcanteen.Backend.dto.DayOfWeek; // ✅ This is your custom enum
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuItemService menuItemService;
    private final WeeklyMenuService weeklyMenuService;

    @Autowired
    public MenuController(MenuItemService menuItemService, WeeklyMenuService weeklyMenuService) {
        this.menuItemService = menuItemService;
        this.weeklyMenuService = weeklyMenuService;
    }

    @PostMapping("/items")
    public ResponseEntity<MenuItemDTO> createMenuItem(@RequestBody MenuItemRequest request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        MenuItemDTO createdItem = menuItemService.createMenuItem(request, userDetails.getUsername());
        return ResponseEntity.ok(createdItem);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(@PathVariable Long id,
                                                     @RequestBody MenuItemRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        MenuItemDTO updatedItem = menuItemService.updateMenuItem(id, request, userDetails.getUsername());
        return ResponseEntity.ok(updatedItem);
    }

    @GetMapping("/items")
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }

 
    
    @GetMapping("/items/active")
    public ResponseEntity<List<MenuItemDTO>> getActiveMenuItems(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam(required = false) String category) {
        LocalDateTime queryDate = date != null ? date : LocalDateTime.now();
        return ResponseEntity.ok(menuItemService.getActiveMenuItems(queryDate, category));
    }


    @GetMapping("/items/filter")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsWithFilters(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(menuItemService.getMenuItemsWithFilters(
                name, category, startDate, endDate, activeOnly));
    }

    @GetMapping("/items/price-history")
    public ResponseEntity<List<PriceHistoryDTO>> getPriceHistory(@RequestParam String name) {
        return ResponseEntity.ok(menuItemService.getPriceHistory(name));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/weekly")
    public ResponseEntity<WeeklyMenuDTO> createWeeklyMenuItem(@RequestBody WeeklyMenuDTO request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        WeeklyMenuDTO createdItem = weeklyMenuService.createWeeklyMenuItem(request, userDetails.getUsername());
        return ResponseEntity.ok(createdItem);
    }
    
  
  
    @GetMapping("/weekly/day")
    public ResponseEntity<List<WeeklyMenuDTO>> getWeeklyMenuForDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam java.time.DayOfWeek dayOfWeek,
            @RequestParam(required = false, defaultValue = "") String category) {
        return ResponseEntity.ok(weeklyMenuService.getWeeklyMenuForDay(date, dayOfWeek, category));
    }




    @GetMapping("/weekly/range")
    public ResponseEntity<List<WeeklyMenuDTO>> getWeeklyMenusBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(weeklyMenuService.getWeeklyMenusBetweenDates(startDate, endDate));
    }

    @DeleteMapping("/weekly/{id}")
    public ResponseEntity<Void> deleteWeeklyMenuItem(@PathVariable Long id) {
        weeklyMenuService.deleteWeeklyMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}