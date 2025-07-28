package Pcanteen.Backend.service;

import Pcanteen.Backend.dto.MenuItemDTO;
import Pcanteen.Backend.dto.MenuItemRequest;
import Pcanteen.Backend.dto.PriceHistoryDTO;
import Pcanteen.Backend.exception.ResourceNotFoundException;
import Pcanteen.Backend.model.MenuItem;
import Pcanteen.Backend.repository.MenuItemRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import Pcanteen.Backend.config.AppConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public MenuItemService(MenuItemRepository menuItemRepository, ModelMapper modelMapper) {
        this.menuItemRepository = menuItemRepository;
        this.modelMapper = modelMapper;
        
     // this.modelMapper.getConfiguration()
     //  .setFieldMatchingEnabled(true)
     //   .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);

    }
    
    public MenuItemDTO createMenuItem(MenuItemRequest request, String createdBy) {
        if (request.getCategories() == null || request.getCategories().isEmpty()) {
            throw new IllegalArgumentException("At least one category must be specified");
        }

        // For the first category, create the main item
        String primaryCategory = request.getCategories().get(0);
        MenuItem menuItem = modelMapper.map(request, MenuItem.class);
        menuItem.setCategory(primaryCategory);
        menuItem.setCreatedBy(createdBy);
        menuItem.setAvailableStatus(request.getAvailableStatus());
        MenuItem savedItem = menuItemRepository.save(menuItem);

        // For additional categories, create duplicate items
        if (request.getCategories().size() > 1) {
            for (int i = 1; i < request.getCategories().size(); i++) {
                MenuItem duplicateItem = modelMapper.map(request, MenuItem.class);
                duplicateItem.setCategory(request.getCategories().get(i));
                duplicateItem.setCreatedBy(createdBy);
                duplicateItem.setAvailableStatus(request.getAvailableStatus());
                duplicateItem.setMenuId(null); // Reset to generate new ID
                menuItemRepository.save(duplicateItem);
            }
        }

        return modelMapper.map(savedItem, MenuItemDTO.class);
    }

    public MenuItemDTO updateMenuItem(Long id, MenuItemRequest request, String updatedBy) {
        Optional<MenuItem> existingOptional = menuItemRepository.findById(id);
        if (existingOptional.isEmpty()) {
            throw new RuntimeException("Menu item not found");
        }

        MenuItem existing = existingOptional.get();

        boolean priceChanged = !Objects.equals(existing.getPrice(), request.getPrice());

        // If price changed → Create new row (instead of modifying existing one)
        if (priceChanged) {
            MenuItem newItem = new MenuItem();
            newItem.setName(request.getName());
            newItem.setDescription(request.getDescription());
            newItem.setCategory(existing.getCategory()); // exact same category
            newItem.setPrice(request.getPrice());
            newItem.setUnit(request.getUnit());
            newItem.setQuantity(request.getQuantity());
            newItem.setAvailableStatus(request.getAvailableStatus());
            newItem.setStartDate(request.getStartDate());
            newItem.setEndDate(request.getEndDate());
            newItem.setCreatedBy(existing.getCreatedBy());
            newItem.setUpdatedBy(updatedBy); // ✅ Set updater
            menuItemRepository.save(newItem);
            return new MenuItemDTO(newItem);
        }

        // Otherwise just update the existing item
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setUnit(request.getUnit());
        existing.setQuantity(request.getQuantity());
        existing.setAvailableStatus(request.getAvailableStatus());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setUpdatedBy(updatedBy); // ✅ Set updater
        menuItemRepository.save(existing);

        return new MenuItemDTO(existing);
    }

    
    
   /* public void updateMenuItem(Long id, MenuItemRequest request) {
        Optional<MenuItem> existingOptional = menuItemRepository.findById(id);
        if (existingOptional.isEmpty()) {
            throw new RuntimeException("Menu item not found");
        }

        MenuItem existing = existingOptional.get();
        String name = request.getName();

        List<MenuItem> existingVariants = menuItemRepository.findByName(name);
        Set<String> existingCategories = existingVariants.stream()
            .map(MenuItem::getCategory)
            .collect(Collectors.toSet());

        Set<String> incomingCategories = new HashSet<>(request.getCategories());

        // ✅ 1. Update only the current row (the one being edited)
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setUnit(request.getUnit());
        existing.setQuantity(request.getQuantity());
        existing.setAvailableStatus(request.getAvailableStatus());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        menuItemRepository.save(existing);

        // ✅ 2. Create rows only for truly new categories
        Set<String> newCategories = incomingCategories.stream()
            .filter(cat -> !existingCategories.contains(cat))
            .collect(Collectors.toSet());

        for (String newCategory : newCategories) {
            MenuItem newItem = new MenuItem();
            newItem.setName(request.getName());
            newItem.setDescription(request.getDescription());
            newItem.setCategory(newCategory);
            newItem.setPrice(request.getPrice());
            newItem.setUnit(request.getUnit());
            newItem.setQuantity(request.getQuantity());
            newItem.setAvailableStatus(request.getAvailableStatus());
            newItem.setStartDate(request.getStartDate());
            newItem.setEndDate(request.getEndDate());
            menuItemRepository.save(newItem);
        }
    }*/

  
  /*  public MenuItemDTO createMenuItem(MenuItemRequest request, String createdBy) {
        MenuItem menuItem = modelMapper.map(request, MenuItem.class);
        menuItem.setCreatedBy(createdBy);
        menuItem.setUpdatedBy(createdBy);
        MenuItem savedItem = menuItemRepository.save(menuItem);
        return modelMapper.map(savedItem, MenuItemDTO.class);
    }

    public MenuItemDTO updateMenuItem(Long id, MenuItemRequest request, String updatedBy) {
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        
        // Create a new version if price is changing
        if (!existingItem.getPrice().equals(request.getPrice())) {
            return createMenuItem(request, updatedBy);
        }
        
        // Otherwise update existing item
        modelMapper.map(request, existingItem);
        existingItem.setUpdatedBy(updatedBy);
        MenuItem updatedItem = menuItemRepository.save(existingItem);
        return modelMapper.map(updatedItem, MenuItemDTO.class);
    }*/

    public List<MenuItemDTO> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(item -> modelMapper.map(item, MenuItemDTO.class))
                .collect(Collectors.toList());
    }

   
    
   public List<MenuItemDTO> getActiveMenuItems(LocalDateTime date, String category) {
        return menuItemRepository.findActiveItemsOnDate(date).stream()
            .filter(item -> category == null || item.getCategory().equalsIgnoreCase(category))
            .map(item -> modelMapper.map(item, MenuItemDTO.class))
            .collect(Collectors.toList());
    }


    public List<MenuItemDTO> getMenuItemsWithFilters(String name, String category, 
                                                   LocalDateTime startDate, LocalDateTime endDate, 
                                                   Boolean activeOnly) {
        return menuItemRepository.findWithFilters(name, category, startDate, endDate, activeOnly).stream()
                .map(item -> modelMapper.map(item, MenuItemDTO.class))
                .collect(Collectors.toList());
    }

   
 // MenuItemService.java
  /*  public List<PriceHistoryDTO> getPriceHistory(String name, String category) {
        return menuItemRepository.findPriceHistoryByNameAndCategory(name, category)
                .stream()
                .map(item -> {
                    PriceHistoryDTO dto = modelMapper.map(item, PriceHistoryDTO.class);
                    dto.setIsActive(isItemActive(item));
                    dto.setAvailableStatus(item.getAvailableStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }*/
    
 // MenuItemService.java
    public List<PriceHistoryDTO> getPriceHistory(String name, String category) {
        // Get all items with the same name regardless of category
        List<MenuItem> allItems = menuItemRepository.findByNameOrderByCreatedAtDesc(name);
        
        // Filter by category if specified
        List<MenuItem> filteredItems = category == null ? 
            allItems : 
            allItems.stream().filter(item -> item.getCategory().equals(category)).collect(Collectors.toList());
        
        // Also get all categories this item exists in
        Set<String> allCategories = allItems.stream()
            .map(MenuItem::getCategory)
            .collect(Collectors.toSet());
        
        return filteredItems.stream()
            .map(item -> {
                PriceHistoryDTO dto = new PriceHistoryDTO();
                dto.setId(item.getId());
                dto.setMenuId(item.getMenuId());
                dto.setName(item.getName());
                dto.setCategory(item.getCategory());
                dto.setPrice(item.getPrice());
                dto.setStartDate(item.getStartDate());
                dto.setEndDate(item.getEndDate());
                dto.setIsActive(isItemActive(item));
                dto.setCreatedAt(item.getCreatedAt());
                dto.setCreatedBy(item.getCreatedBy());
                dto.setAvailableStatus(item.getAvailableStatus());
                dto.setAllCategories(allCategories); // Add all available categories
                return dto;
            })
            .collect(Collectors.toList());
    }

 

    public MenuItemDTO updateAvailability(Long id, Boolean availableStatus, String updatedBy) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        
        item.setAvailableStatus(availableStatus);
        item.setUpdatedBy(updatedBy);
        MenuItem updatedItem = menuItemRepository.save(item);
        
        return modelMapper.map(updatedItem, MenuItemDTO.class);
    }

    private boolean isItemActive(MenuItem item) {
        LocalDateTime now = LocalDateTime.now();
        return !now.isBefore(item.getStartDate()) && !now.isAfter(item.getEndDate());
    }

    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
}