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
import java.util.List;
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
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        // If price changed, create new items for all categories
        if (!existingItem.getPrice().equals(request.getPrice())) {
            // End validity of existing item
            existingItem.setEndDate(LocalDateTime.now().minusDays(1));
            menuItemRepository.save(existingItem);

            // Create new items for all categories
            if (request.getCategories() == null || request.getCategories().isEmpty()) {
                throw new IllegalArgumentException("At least one category must be specified");
            }

            MenuItemDTO firstItem = null;
            for (String category : request.getCategories()) {
                MenuItem newItem = modelMapper.map(request, MenuItem.class);
                newItem.setCategory(category);
                newItem.setCreatedBy(updatedBy);
                newItem.setAvailableStatus(request.getAvailableStatus());
                newItem.setStartDate(LocalDateTime.now()); // New price starts today
                newItem.setMenuId(null); // Generate new ID
                
                MenuItem savedItem = menuItemRepository.save(newItem);
                if (firstItem == null) {
                    firstItem = modelMapper.map(savedItem, MenuItemDTO.class);
                }
            }
            return firstItem;
        }

        // For non-price updates
        existingItem.setDescription(request.getDescription());
        existingItem.setQuantity(request.getQuantity());
        existingItem.setUnit(request.getUnit());
        existingItem.setStartDate(request.getStartDate());
        existingItem.setEndDate(request.getEndDate());
        existingItem.setAvailableStatus(request.getAvailableStatus());
        existingItem.setUpdatedBy(updatedBy);
        
        // Keep original category - don't update from request
        MenuItem updatedItem = menuItemRepository.save(existingItem);
        return modelMapper.map(updatedItem, MenuItemDTO.class);
    }
  
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

   /* public List<PriceHistoryDTO> getPriceHistory(String name) {
        return menuItemRepository.findPriceHistoryByName(name).stream()
                .map(item -> {
                    PriceHistoryDTO dto = modelMapper.map(item, PriceHistoryDTO.class);
                    LocalDateTime now = LocalDateTime.now();
                    dto.setWasActive(!now.isBefore(item.getStartDate()) && !now.isAfter(item.getEndDate()));
                    return dto;
                })
                .collect(Collectors.toList());
    }*/
   /* public List<PriceHistoryDTO> getPriceHistory(String name) {
        // Get all items with this name, ordered by creation date (newest first)
        List<MenuItem> items = menuItemRepository.findByNameOrderByCreatedAtDesc(name);
        
        return items.stream()
            .map(item -> {
                PriceHistoryDTO dto = new PriceHistoryDTO();
                dto.setPrice(item.getPrice());
                dto.setStartDate(item.getStartDate());
                dto.setEndDate(item.getEndDate());
                dto.setWasActive(isItemActive(item));
                dto.setCreatedAt(item.getCreatedAt());
                dto.setCreatedBy(item.getCreatedBy());
                return dto;
            })
            .collect(Collectors.toList());
    }*/
    
 // MenuItemService.java
    public List<PriceHistoryDTO> getPriceHistory(String name, String category) {
        return menuItemRepository.findPriceHistoryByNameAndCategory(name, category)
                .stream()
                .map(item -> {
                    PriceHistoryDTO dto = modelMapper.map(item, PriceHistoryDTO.class);
                    dto.setIsActive(isItemActive(item));
                    dto.setAvailableStatus(item.getAvailableStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }

   /* private boolean isItemActive(MenuItem item) {
        LocalDateTime now = LocalDateTime.now();
        return !now.isBefore(item.getStartDate()) && !now.isAfter(item.getEndDate());
    }*/

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