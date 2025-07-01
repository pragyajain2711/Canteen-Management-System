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
    }

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

    public List<PriceHistoryDTO> getPriceHistory(String name) {
        return menuItemRepository.findPriceHistoryByName(name).stream()
                .map(item -> {
                    PriceHistoryDTO dto = modelMapper.map(item, PriceHistoryDTO.class);
                    LocalDateTime now = LocalDateTime.now();
                    dto.setWasActive(!now.isBefore(item.getStartDate()) && !now.isAfter(item.getEndDate()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
}