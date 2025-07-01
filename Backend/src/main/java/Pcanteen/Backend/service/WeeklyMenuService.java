package Pcanteen.Backend.service;

import Pcanteen.Backend.dto.MenuItemDTO;
import Pcanteen.Backend.dto.WeeklyMenuDTO;
import Pcanteen.Backend.exception.ResourceNotFoundException;
import Pcanteen.Backend.model.MenuItem;
import Pcanteen.Backend.model.WeeklyMenu;
import Pcanteen.Backend.repository.MenuItemRepository;
import Pcanteen.Backend.repository.WeeklyMenuRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WeeklyMenuService {

    private final WeeklyMenuRepository weeklyMenuRepository;
    private final MenuItemRepository menuItemRepository; // Add this

    private final MenuItemService menuItemService;
    private final ModelMapper modelMapper;
    
/*
    @Autowired
    public WeeklyMenuService(WeeklyMenuRepository weeklyMenuRepository, 
                           MenuItemService menuItemService, 
                           ModelMapper modelMapper) {
        this.weeklyMenuRepository = weeklyMenuRepository;
        this.menuItemService = menuItemService;
        this.modelMapper = modelMapper;
    */
    @Autowired
    public WeeklyMenuService(WeeklyMenuRepository weeklyMenuRepository,
                           MenuItemRepository menuItemRepository, // Add this
                           MenuItemService menuItemService, 
                           ModelMapper modelMapper) {
        this.weeklyMenuRepository = weeklyMenuRepository;
        this.menuItemService = menuItemService;
        this.menuItemRepository = menuItemRepository; // Add this
        this.modelMapper = modelMapper;
    }

  /*  public WeeklyMenuDTO createWeeklyMenuItem(WeeklyMenuDTO request, String createdBy) {
        WeeklyMenu weeklyMenu = modelMapper.map(request, WeeklyMenu.class);
        weeklyMenu.setCreatedBy(createdBy);
        WeeklyMenu savedItem = weeklyMenuRepository.save(weeklyMenu);
        return modelMapper.map(savedItem, WeeklyMenuDTO.class);
    }
    
   public WeeklyMenuDTO createWeeklyMenuItem(WeeklyMenuDTO request, String createdBy) {
        WeeklyMenu weeklyMenu = modelMapper.map(request, WeeklyMenu.class);
        weeklyMenu.setCreatedBy(createdBy);

        WeeklyMenu savedItem = weeklyMenuRepository.save(weeklyMenu);

        WeeklyMenuDTO dto = modelMapper.map(savedItem, WeeklyMenuDTO.class);
        dto.setMenuItem(new MenuItemDTO(savedItem.getMenuItem())); // ✅ fix here
        return dto;
    }
*/

/*    public WeeklyMenuDTO createWeeklyMenuItem(WeeklyMenuDTO request, String createdBy) {
        WeeklyMenu weeklyMenu = new WeeklyMenu();

        weeklyMenu.setDayOfWeek(request.getDayOfWeek());
        weeklyMenu.setWeekStartDate(request.getWeekStartDate());
        weeklyMenu.setWeekEndDate(request.getWeekEndDate());
        weeklyMenu.setMealCategory(request.getMealCategory());
        weeklyMenu.setCreatedBy(createdBy);
        weeklyMenu.setCreatedAt(LocalDateTime.now());

        // ✅ Fetch actual MenuItem entity from DB by ID
        MenuItem menuItem = menuItemService.getEntityById(request.getMenuItem().getId());
        weeklyMenu.setMenuItem(menuItem);

        WeeklyMenu saved = weeklyMenuRepository.save(weeklyMenu);

        // ✅ Now build DTO with full MenuItemDTO populated
        WeeklyMenuDTO dto = new WeeklyMenuDTO();
        dto.setId(saved.getId());
        dto.setWeekStartDate(saved.getWeekStartDate());
        dto.setWeekEndDate(saved.getWeekEndDate());
        dto.setDayOfWeek(saved.getDayOfWeek());
        dto.setMealCategory(saved.getMealCategory());
        dto.setCreatedAt(saved.getCreatedAt());
        dto.setCreatedBy(saved.getCreatedBy());
        dto.setMenuItem(new MenuItemDTO(menuItem)); // ✅ fully populate

        return dto;
    }
*/
    
    public WeeklyMenuDTO createWeeklyMenuItem(WeeklyMenuDTO request, String createdBy) {
        WeeklyMenu weeklyMenu = new WeeklyMenu();
      //  weeklyMenu.setDayOfWeek(request.getDayOfWeek());
        weeklyMenu.setDayOfWeek(java.time.DayOfWeek.valueOf(request.getDayOfWeek().name()));

        weeklyMenu.setWeekStartDate(request.getWeekStartDate());
        weeklyMenu.setWeekEndDate(request.getWeekEndDate());
        weeklyMenu.setMealCategory(request.getMealCategory());
        weeklyMenu.setCreatedBy(createdBy);
        weeklyMenu.setCreatedAt(LocalDateTime.now());

        // Fetch by menuId instead of id
        MenuItem menuItem = menuItemRepository.findByMenuId(request.getMenuItem().getMenuId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Menu item not found with menuId: " + request.getMenuItem().getMenuId()));
        
        weeklyMenu.setMenuItem(menuItem);

        WeeklyMenu saved = weeklyMenuRepository.save(weeklyMenu);

        // Build DTO
        WeeklyMenuDTO dto = modelMapper.map(saved, WeeklyMenuDTO.class);
        dto.setMenuItem(modelMapper.map(saved.getMenuItem(), MenuItemDTO.class));
        
        return dto;
    }
    
    public List<WeeklyMenuDTO> getWeeklyMenuForDay(LocalDateTime date, DayOfWeek dayOfWeek, String category) {
        return weeklyMenuRepository.findWeeklyMenuItems(date, dayOfWeek, category).stream()
                .map(item -> modelMapper.map(item, WeeklyMenuDTO.class))
                .collect(Collectors.toList());
    }

    public List<WeeklyMenuDTO> getWeeklyMenusBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return weeklyMenuRepository.findWeeklyMenusBetweenDates(startDate, endDate).stream()
                .map(item -> modelMapper.map(item, WeeklyMenuDTO.class))
                .collect(Collectors.toList());
    }

    public void deleteWeeklyMenuItem(Long id) {
        weeklyMenuRepository.deleteById(id);
    }
}
