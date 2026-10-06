package com.exe201.rrms.controller;

import com.exe201.rrms.entity.Property;
import com.exe201.rrms.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @GetMapping("/available")
    public List<Property> getAvailableProperties(@RequestParam(required = false) String search) {
        List<Property> props = propertyRepository.findByStatus("Available");
        if (search != null && !search.isEmpty()) {
            return props.stream()
                    .filter(p -> (p.getProvince() != null && p.getProvince().toLowerCase().contains(search.toLowerCase()))
                              || (p.getDistrict() != null && p.getDistrict().toLowerCase().contains(search.toLowerCase()))
                              || p.getName().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList());
        }
        return props;
    }
    
    @GetMapping("/landlord/{id}")
    public List<Property> getLandlordProperties(@PathVariable Long id) {
        return propertyRepository.findByLandlordId(id);
    }

    @PostMapping
    public Property createProperty(@RequestBody Property property) {
        return propertyRepository.save(property);
    }
    
    @PutMapping("/{id}")
    public Property updateProperty(@PathVariable Long id, @RequestBody Property propertyDetails) {
        propertyDetails.setId(id);
        return propertyRepository.save(propertyDetails);
    }
    
    @PutMapping("/{id}/status")
    public Property updateStatus(@PathVariable Long id, @RequestBody String status) {
        Property p = propertyRepository.findById(id).orElseThrow();
        p.setStatus(status.replace("\"", ""));
        return propertyRepository.save(p);
    }

    @DeleteMapping("/{id}")
    public void deleteProperty(@PathVariable Long id) {
        propertyRepository.deleteById(id);
    }

    @Autowired
    private com.exe201.rrms.repository.UserRepository userRepository;

    @PostMapping("/sync-subscription/{userId}")
    public void syncSubscription(@PathVariable Long userId) {
        com.exe201.rrms.entity.User user = userRepository.findById(userId).orElseThrow();
        List<Property> props = propertyRepository.findByLandlordId(userId);
        
        boolean isExpired = false;
        if (user.getPackageExpiryDate() != null && !user.getPackageExpiryDate().isEmpty()) {
            try {
                java.time.Instant expiry = java.time.Instant.parse(user.getPackageExpiryDate());
                if (expiry.isBefore(java.time.Instant.now())) {
                    isExpired = true;
                }
            } catch(Exception e) {}
        }
        
        if (isExpired) {
            // Downgrade
            user.setPostLimit(3);
            user.setCurrentPackage("Mặc định");
            user.setPackageExpiryDate(null);
            userRepository.save(user);
            
            // Auto draft excess active posts
            List<Property> activeProps = props.stream().filter(p -> !"DRAFT".equals(p.getStatus())).collect(Collectors.toList());
            if (activeProps.size() > 3) {
                for (int i = 3; i < activeProps.size(); i++) {
                    Property p = activeProps.get(i);
                    p.setStatus("DRAFT");
                    p.setAutoDrafted(true);
                    propertyRepository.save(p);
                }
            }
        } else if (user.getPostLimit() > 3) {
            // Upgraded - republish auto-drafted
            int activeCount = (int) props.stream().filter(p -> !"DRAFT".equals(p.getStatus())).count();
            for (Property p : props) {
                if (Boolean.TRUE.equals(p.getAutoDrafted())) {
                    if (activeCount < user.getPostLimit()) {
                        p.setStatus("Available"); // Wait, standard status is 'Available'
                        p.setAutoDrafted(false);
                        propertyRepository.save(p);
                        activeCount++;
                    }
                }
            }
        }
    }
}
